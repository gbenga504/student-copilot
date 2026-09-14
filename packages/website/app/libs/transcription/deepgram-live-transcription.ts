import { z } from "zod";

import type {
  LiveTranscriptionCallbacks,
  LiveTranscriptionClient,
  LiveTranscriptionSession,
} from "./live-transcription";

const DEEPGRAM_STREAM_URL = new URL("wss://api.deepgram.com/v1/listen");
DEEPGRAM_STREAM_URL.search = new URLSearchParams({
  channels: "1",
  encoding: "linear16",
  endpointing: "100",
  interim_results: "true",
  language: "multi",
  model: "nova-3",
  sample_rate: "16000",
  smart_format: "true",
}).toString();

const resultMessageSchema = z.object({
  type: z.literal("Results"),
  is_final: z.boolean().optional().default(false),
  channel: z.object({
    alternatives: z.array(z.object({ transcript: z.string() })),
  }),
});

export class DeepgramLiveTranscriptionClient
  implements LiveTranscriptionClient
{
  connect(
    accessToken: string,
    callbacks: LiveTranscriptionCallbacks
  ): Promise<LiveTranscriptionSession> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(DEEPGRAM_STREAM_URL, [
        "bearer",
        accessToken,
      ]);

      socket.addEventListener(
        "open",
        () => resolve(new DeepgramLiveTranscriptionSession(socket)),
        { once: true }
      );
      socket.addEventListener("message", (event) => {
        let payload: unknown;

        try {
          payload = JSON.parse(String(event.data));
        } catch {
          return;
        }

        const message = resultMessageSchema.safeParse(payload);

        if (!message.success) {
          return;
        }

        const text = message.data.channel.alternatives[0]?.transcript.trim();

        if (text) {
          callbacks.onResult({ final: message.data.is_final, text });
        }
      });
      socket.addEventListener("error", () => {
        const message = "The live transcription connection failed.";
        callbacks.onError(message);
        reject(new Error(message));
      });
    });
  }
}

class DeepgramLiveTranscriptionSession implements LiveTranscriptionSession {
  constructor(private readonly socket: WebSocket) {}

  sendAudio(audio: ArrayBuffer): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(audio);
    }
  }

  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket.readyState !== WebSocket.OPEN) {
        resolve();
        return;
      }

      const closeTimeout = window.setTimeout(() => {
        this.socket.close();
        resolve();
      }, 2_000);

      this.socket.addEventListener(
        "close",
        () => {
          window.clearTimeout(closeTimeout);
          resolve();
        },
        { once: true }
      );
      this.socket.send(JSON.stringify({ type: "CloseStream" }));
    });
  }
}