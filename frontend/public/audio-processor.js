// public/audio-processor.js
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Buffer small frames in processor and post them to main thread
  }

  process(inputs/*, outputs, parameters */) {
    const input = inputs[0];
    if (input && input[0]) {
      // input[0] is Float32Array of samples for this block
      this.port.postMessage(input[0]);
    }
    // Keep processor alive
    return true;
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
