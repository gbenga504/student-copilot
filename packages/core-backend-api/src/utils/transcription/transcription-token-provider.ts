export type TranscriptionToken = {
  accessToken: string;
  expiresIn: number;
};

export interface TranscriptionTokenProvider {
  createToken(): Promise<TranscriptionToken>;
}

export class TranscriptionProviderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TranscriptionProviderError";
  }
}
