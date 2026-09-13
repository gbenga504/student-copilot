import type { AxiosInstance } from "axios";

import { throwApiError } from "~/errors/api-error";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type UpdateNoteParams = {
  title: string;
  content: string;
};

export class NotesResource {
  constructor(private readonly httpClient: AxiosInstance) {}

  async create(): Promise<Note> {
    try {
      const response = await this.httpClient.post<Note>("/notes");

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async list(): Promise<Note[]> {
    try {
      const response = await this.httpClient.get<Note[]>("/notes");

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async get(noteId: string): Promise<Note> {
    try {
      const response = await this.httpClient.get<Note>(`/notes/${noteId}`);

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async update(noteId: string, params: UpdateNoteParams): Promise<Note> {
    try {
      const response = await this.httpClient.patch<Note>(
        `/notes/${noteId}`,
        params
      );

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async delete(noteId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/notes/${noteId}`);
    } catch (error) {
      throwApiError(error);
    }
  }
}