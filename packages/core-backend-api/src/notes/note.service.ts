import { APP_ERROR_CODES, AppError } from "../utils/http/app-error";
import type { NoteRepository } from "./repositories/note.repository";

export type NoteServiceDependencies = {
  repository: NoteRepository;
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
}

function noteNotFoundError(): AppError {
  return new AppError(
    404,
    APP_ERROR_CODES.RESOURCE_NOT_FOUND,
    "Note not found"
  );
}
