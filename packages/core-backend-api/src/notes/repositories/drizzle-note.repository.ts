import { and, desc, eq } from "drizzle-orm";

import type { Database } from "../../utils/database";
import type { NoteRepository, UpdateNoteParams } from "./note.repository";
import { notes } from "./note.schema";

export class DrizzleNoteRepository implements NoteRepository {
  constructor(private readonly database: Database) {}

  async create(userId: string, title: string, content: string) {
    const [note] = await this.database
      .insert(notes)
      .values({ userId, title, content })
      .returning({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        createdAt: notes.createdAt,
      });

    return note;
  }

  async findAllByUserId(userId: string) {
    return this.database
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        createdAt: notes.createdAt,
      })
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  }

  async findByIdAndUserId(id: string, userId: string) {
    const [note] = await this.database
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        createdAt: notes.createdAt,
      })
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .limit(1);

    return note ?? null;
  }

  async updateByIdAndUserId(userId: string, params: UpdateNoteParams) {
    const [note] = await this.database
      .update(notes)
      .set({ title: params.title, content: params.content })
      .where(and(eq(notes.id, params.noteId), eq(notes.userId, userId)))
      .returning({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        createdAt: notes.createdAt,
      });

    return note ?? null;
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<boolean> {
    const deletedNotes = await this.database
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning({ id: notes.id });

    return deletedNotes.length > 0;
  }
}
