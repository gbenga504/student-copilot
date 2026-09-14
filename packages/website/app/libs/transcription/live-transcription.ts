export type TranscriptionResult = {
  final: boolean;
  text: string;
};

export type LiveTranscriptionCallbacks = {
  onError: (message: string) => void;
  onResult: (result: TranscriptionResult) => void;
};

export interface LiveTranscriptionSession {
  close(): Promise<void>;
  sendAudio(audio: ArrayBuffer): void;
}

export interface LiveTranscriptionClient {
  connect(
    accessToken: string,
    callbacks: LiveTranscriptionCallbacks
  ): Promise<LiveTranscriptionSession>;
}