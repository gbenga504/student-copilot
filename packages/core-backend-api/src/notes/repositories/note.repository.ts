import type { Note } from "../entities/note.entity";

export type TranscriptChunk = {
  id: string;
  text: string;
  createdAt: Date;
};

export type AppendTranscriptChunkParams = {
  id: string;
  text: string;
};

export type UpdateNoteParams = {
  noteId: string;
  title: string;
  content: string;
};

export interface NoteRepository {
  create(userId: string, title: string, content: string): Promise<Note>;
  findAllByUserId(userId: string): Promise<Note[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Note | null>;
  findTranscriptChunks(noteId: string): Promise<TranscriptChunk[]>;
  appendTranscriptChunks(
    noteId: string,
    chunks: AppendTranscriptChunkParams[]
  ): Promise<void>;
  updateByIdAndUserId(
    userId: string,
    params: UpdateNoteParams
  ): Promise<Note | null>;
  deleteByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
