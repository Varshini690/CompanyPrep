import { useEffect, useRef, useState } from "react";

function floatTo16BitPCM(float32Array) {
  const l = float32Array.length;
  const buf = new ArrayBuffer(l * 2);
  const view = new DataView(buf);
  let offset = 0;
  for (let i = 0; i < l; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return view;
}

function writeWavHeader(view, sampleRate, numChannels, dataLength) {
  const blockAlign = numChannels * 2;
  const byteRate = sampleRate * blockAlign;
  // RIFF identifier
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // size of fmt chunk
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default function InterviewCall() {
  const wsRef = useRef(null);

  // If using MediaRecorder (ogg), store recorder here.
  const mediaRecorderRef = useRef(null);

  // For WAV fallback
  const audioContextRef = useRef(null);
  const recorderNodeRef = useRef(null);
  const wavChunksRef = useRef([]);
  const inputRef = useRef(null);
  const streamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws/interview/");

    wsRef.current.onopen = () => console.log("WS Connected");

    wsRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "transcript") setTranscript(data.text);
        console.log("Server:", data);
      } catch (err) {
        console.warn("Invalid JSON from WS:", e.data);
      }
    };

    wsRef.current.onclose = () => console.log("WS Closed");

    return () => {
      if (wsRef.current) wsRef.current.close();
      stopWavRecordingCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- WAV fallback implementation ----
  async function startWavRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const input = audioContext.createMediaStreamSource(stream);
    inputRef.current = input;

    // Use ScriptProcessor (works in many browsers). Buffer size 4096.
    const bufferSize = 4096;
    const numChannels = 1; // mono
    const recorder = audioContext.createScriptProcessor(bufferSize, numChannels, numChannels);

    wavChunksRef.current = [];

    recorder.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0);
      // copy the Float32Array data
      wavChunksRef.current.push(new Float32Array(channelData));
    };

    input.connect(recorder);
    recorder.connect(audioContext.destination); // required to start processing
    recorderNodeRef.current = recorder;
  }

  function stopWavRecordingCleanup() {
    try {
      if (recorderNodeRef.current) {
        recorderNodeRef.current.disconnect();
        recorderNodeRef.current.onaudioprocess = null;
        recorderNodeRef.current = null;
      }
      if (inputRef.current) {
        inputRef.current.disconnect();
        inputRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    } catch (e) {
      console.warn("cleanup error", e);
    }
  }

  async function finalizeAndSendWav() {
    const floats = wavChunksRef.current;
    if (!floats || floats.length === 0) return;

    // concatenate
    let totalLength = floats.reduce((acc, a) => acc + a.length, 0);
    const result = new Float32Array(totalLength);
    let offset = 0;
    for (let i = 0; i < floats.length; i++) {
      result.set(floats[i], offset);
      offset += floats[i].length;
    }

    const sampleRate = (audioContextRef.current && audioContextRef.current.sampleRate) || 16000;
    // convert float to 16-bit PCM DataView
    const pcmView = floatTo16BitPCM(result);
    const dataLength = pcmView.byteLength;
    const wavBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(wavBuffer);

    // write header then PCM
    writeWavHeader(view, sampleRate, 1, dataLength);
    // Write PCM samples after header (offset 44)
    const pcmBytes = new Uint8Array(wavBuffer, 44);
    const src = new Uint8Array(pcmView.buffer);
    pcmBytes.set(src);

    // base64 encode
    const blob = new Blob([view], { type: "audio/wav" });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(",")[1];
      // send via websocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "audio_chunk",
          data: base64,
          format: "audio/wav"
        }));
      }
    };
    reader.readAsDataURL(blob);

    // clear buffer
    wavChunksRef.current = [];
  }

  // ---- main start/stop logic ----
  const startRecording = async () => {
    // try OGG first
    let oggMime = "audio/ogg; codecs=opus";
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(oggMime)) {
      // use MediaRecorder OGG (preferred)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: oggMime });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev) => {
        if (!ev.data || ev.data.size < 4000) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: "audio_chunk",
              data: base64,
              format: oggMime
            }));
          }
        };
        reader.readAsDataURL(ev.data);
      };

      mr.start(1000); // 1s chunks
      setIsRecording(true);
      console.log("Using OGG MediaRecorder");
      return;
    }

    // OGG unsupported → fallback to WAV recorder
    // inform user optionally
    console.warn("OGG not supported — falling back to WAV (WebAudio)");
    await startWavRecording();
    setIsRecording(true);

    // send periodic WAV chunks (every 2s)
    recorderNodeRef.current._sendInterval = setInterval(async () => {
      // capture and send WAV
      await finalizeAndSendWav();
    }, 2000);
  };

  const stopRecording = async () => {
    setIsRecording(false);

    // If MediaRecorder used:
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) { /**/ }
      // stop tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
      return;
    }

    // If WAV fallback used:
    if (recorderNodeRef.current) {
      clearInterval(recorderNodeRef.current._sendInterval);
      // finalize last chunk and send
      await finalizeAndSendWav();
      stopWavRecordingCleanup();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>AI Interview</h2>

      {!isRecording ? (
        <button onClick={startRecording}>Start Interview</button>
      ) : (
        <button onClick={stopRecording}>Stop Interview</button>
      )}

      <div
        style={{
          marginTop: "20px",
          background: "#eee",
          padding: "12px",
          borderRadius: "8px",
          minHeight: "120px",
          whiteSpace: "pre-wrap",
        }}
      >
        <h3>Live Transcript:</h3>
        <p>{transcript || "Say something…"}</p>
      </div>
    </div>
  );
}
