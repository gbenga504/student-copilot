import { z } from "zod";

export const noteParamsDto = z.object({
  noteId: z.uuid(),
});

export const updateNoteRequestDto = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string(),
});

export const noteResponseDto = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  createdAt: z.iso.datetime(),
});

export const noteListResponseDto = z.array(noteResponseDto);
