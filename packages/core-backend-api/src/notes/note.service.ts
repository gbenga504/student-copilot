import { APP_ERROR_CODES, AppError } from "../utils/http/app-error";
import type { TranscriptionTokenProvider } from "../utils/transcription/transcription-token-provider";
import { TranscriptionProviderError } from "../utils/transcription/transcription-token-provider";
import type { AppendTranscriptChunkParams } from "./repositories/note.repository";
import type { NoteRepository } from "./repositories/note.repository";

export type NoteServiceDependencies = {
  repository: NoteRepository;
  transcriptionTokenProvider: TranscriptionTokenProvider;
};

export class NoteService {
  constructor(private readonly dependencies: NoteServiceDependencies) {}

  create(userId: string) {
    return this.dependencies.repository.create(userId, "New note", "");
  }

  list(userId: string) {
    return this.dependencies.repository.findAllByUserId(userId);
  }

  async get(userId: string, noteId: string) {
    const note = await this.dependencies.repository.findByIdAndUserId(
      noteId,
      userId
    );

    if (!note) {
      throw noteNotFoundError();
    }

    return note;
  }

  async getTranscript(userId: string, noteId: string) {
    await this.ensureUserMayAccessNote(userId, noteId);
    return this.dependencies.repository.findTranscriptChunks(noteId);
  }

  async appendTranscript(
    userId: string,
    params: { noteId: string; chunks: AppendTranscriptChunkParams[] }
  ): Promise<void> {
    await this.ensureUserMayAccessNote(userId, params.noteId);
    await this.dependencies.repository.appendTranscriptChunks(
      params.noteId,
      params.chunks
    );
  }

  async createTranscriptionToken(userId: string, noteId: string) {
    await this.ensureUserMayAccessNote(userId, noteId);

    try {
      return await this.dependencies.transcriptionTokenProvider.createToken();
    } catch (error) {
      if (error instanceof TranscriptionProviderError) {
        throw new AppError(
          503,
          APP_ERROR_CODES.TRANSCRIPTION_UNAVAILABLE,
          "Live transcription is temporarily unavailable"
        );
      }

      throw error;
    }
  }

  async update(
    userId: string,
    params: { noteId: string; title: string; content: string }
  ) {
    const note = await this.dependencies.repository.updateByIdAndUserId(
      userId,
      params
    );

    if (!note) {
      throw noteNotFoundError();
    }

    return note;
  }

  async delete(userId: string, noteId: string): Promise<void> {
    const wasDeleted = await this.dependencies.repository.deleteByIdAndUserId(
      noteId,
      userId
    );

    if (!wasDeleted) {
      throw noteNotFoundError();
    }
  }

  private async ensureUserMayAccessNote(
    userId: string,
    noteId: string
  ): Promise<void> {
    const note = await this.dependencies.repository.findByIdAndUserId(
      noteId,
      userId
    );

    if (!note) {
      throw new AppError(
        403,
        APP_ERROR_CODES.NOT_PERMITTED,
        "Not permitted"
      );
    }
  }
}

function noteNotFoundError(): AppError {
  return new AppError(
    404,
    APP_ERROR_CODES.RESOURCE_NOT_FOUND,
    "Note not found"
  );
}
