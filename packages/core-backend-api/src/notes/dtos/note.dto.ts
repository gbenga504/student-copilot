import { z } from "zod";

export const noteParamsDto = z.object({
  noteId: z.uuid(),
});

export const noteResponseDto = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  createdAt: z.iso.datetime(),
});

export const noteListResponseDto = z.array(noteResponseDto);