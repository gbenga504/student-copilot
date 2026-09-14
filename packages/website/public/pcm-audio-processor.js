const BUFFER_SIZE = 4096;

class PcmAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(BUFFER_SIZE);
    this.offset = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];

    if (!input) {
      return true;
    }

    for (const sample of input) {
      const normalizedSample = Math.max(-1, Math.min(1, sample));
      this.buffer[this.offset] =
        normalizedSample < 0
          ? normalizedSample * 0x8000
          : normalizedSample * 0x7fff;
      this.offset += 1;

      if (this.offset === BUFFER_SIZE) {
        const audio = this.buffer.buffer;
        this.port.postMessage(audio, [audio]);
        this.buffer = new Int16Array(BUFFER_SIZE);
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-audio-processor", PcmAudioProcessor);