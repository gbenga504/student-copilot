import type { Note } from "../entities/note.entity";

export interface NoteRepository {
  create(userId: string, title: string, content: string): Promise<Note>;
  findAllByUserId(userId: string): Promise<Note[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Note | null>;
  deleteByIdAndUserId(id: string, userId: string): Promise<boolean>;
}