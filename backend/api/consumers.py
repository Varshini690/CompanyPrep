from channels.generic.websocket import AsyncWebsocketConsumer
import json
import base64
import tempfile
import os
from faster_whisper import WhisperModel
import ffmpeg

# load model once
model = WhisperModel("base", device="cpu", compute_type="int8")

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.session_text = ""
        await self.send(json.dumps({"message": "WebSocket connected"}))

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get("type") != "audio_chunk":
            await self.send(json.dumps({"echo": data}))
            return

        try:
            audio_bytes = base64.b64decode(data["data"])
            fmt = data.get("format", "").lower()

            # choose extension
            if "wav" in fmt:
                ext = ".wav"
            elif "ogg" in fmt:
                ext = ".ogg"
            else:
                ext = ".webm"

            # save incoming chunk
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp.flush()
                src_path = tmp.name

            wav_path = None
            try:
                if ext == ".wav":
                    wav_path = src_path
                else:
                    # convert to wav (mono 16k)
                    wav_path = src_path + ".wav"
                    (
                        ffmpeg
                        .input(src_path)
                        .output(wav_path, ac=1, ar=16000)
                        .overwrite_output()
                        .run(quiet=True)
                    )

                # transcribe
                segments, info = model.transcribe(wav_path, beam_size=5)
                chunk_text = " ".join([seg.text.strip() for seg in segments if seg.text])

                if chunk_text:
                    self.session_text = (self.session_text + " " + chunk_text).strip()
                    await self.send(json.dumps({
                        "type": "transcript",
                        "text": self.session_text
                    }))

            finally:
                # cleanup temp files
                try:
                    if os.path.exists(src_path):
                        os.remove(src_path)
                    if wav_path and os.path.exists(wav_path) and wav_path != src_path:
                        os.remove(wav_path)
                except Exception:
                    pass

        except Exception as e:
            await self.send(json.dumps({"type": "error", "text": str(e)}))
