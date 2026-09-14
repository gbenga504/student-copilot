const PCM_SAMPLE_RATE = 16_000;
const PCM_PROCESSOR_NAME = "pcm-audio-processor";
const PCM_PROCESSOR_URL = "/pcm-audio-processor.js";

export class PcmAudioCapture {
  private readonly sources = new Set<MediaStreamAudioSourceNode>();

  private constructor(
    private readonly audioContext: AudioContext,
    private readonly processor: AudioWorkletNode
  ) {}

  static async start(
    stream: MediaStream,
    onAudio: (audio: ArrayBuffer) => void
  ): Promise<PcmAudioCapture> {
    const audioContext = new AudioContext({ sampleRate: PCM_SAMPLE_RATE });

    try {
      await audioContext.audioWorklet.addModule(PCM_PROCESSOR_URL);

      const processor = new AudioWorkletNode(
        audioContext,
        PCM_PROCESSOR_NAME,
        {
          channelCount: 1,
          numberOfInputs: 1,
          numberOfOutputs: 0,
        }
      );

      processor.port.addEventListener("message", (event) => {
        if (event.data instanceof ArrayBuffer) {
          onAudio(event.data);
        }
      });
      processor.port.start();
      await audioContext.resume();

      const capture = new PcmAudioCapture(audioContext, processor);
      capture.addStream(stream);

      return capture;
    } catch (error) {
      await audioContext.close();
      throw error;
    }
  }

  addStream(stream: MediaStream): void {
    if (stream.getAudioTracks().length === 0) {
      throw new Error("The selected tab is not sharing audio.");
    }

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.processor);
    this.sources.add(source);
  }

  async close(): Promise<void> {
    for (const source of this.sources) {
      source.disconnect();
    }

    this.sources.clear();
    this.processor.disconnect();
    this.processor.port.close();
    await this.audioContext.close();
  }
}