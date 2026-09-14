import { z } from "zod";

import type {
  TranscriptionToken,
  TranscriptionTokenProvider,
} from "./transcription-token-provider";
import { TranscriptionProviderError } from "./transcription-token-provider";

const DEEPGRAM_TOKEN_URL = "https://api.deepgram.com/v1/auth/grant";
const deepgramTokenDto = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});

export class DeepgramTranscriptionTokenProvider
  implements TranscriptionTokenProvider
{
  constructor(private readonly apiKey: string) {}

  async createToken(): Promise<TranscriptionToken> {
    try {
      return await this.requestToken();
    } catch (error) {
      if (error instanceof TranscriptionProviderError) {
        throw error;
      }

      throw new TranscriptionProviderError(
        "The transcription provider could not be reached",
        { cause: error }
      );
    }
  }

  private async requestToken(): Promise<TranscriptionToken> {
    const response = await fetch(DEEPGRAM_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 60 }),
    });

    if (!response.ok) {
      throw new TranscriptionProviderError(
        "The transcription provider rejected the token request"
      );
    }

    const tokenResult = deepgramTokenDto.safeParse(await response.json());

    if (!tokenResult.success) {
      throw new TranscriptionProviderError(
        "The transcription provider returned an invalid token"
      );
    }

    return {
      accessToken: tokenResult.data.access_token,
      expiresIn: tokenResult.data.expires_in,
    };
  }
}
