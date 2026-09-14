import { z } from "zod";

export const noteParamsDto = z.object({
  noteId: z.uuid(),
});

export const updateNoteRequestDto = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string(),
});

export const appendTranscriptRequestDto = z.object({
  chunks: z
    .array(
      z.object({
        id: z.uuid(),
        text: z.string().trim().min(1),
      })
    )
    .min(1)
    .max(100),
});

export const transcriptChunkResponseDto = z.object({
  id: z.uuid(),
  text: z.string(),
  createdAt: z.iso.datetime(),
});

export const transcriptChunkListResponseDto = z.array(
  transcriptChunkResponseDto
);

export const transcriptionTokenResponseDto = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
});

export const noteResponseDto = z.object({
  id: z.uuid(),
  title: z.string(),
  content: z.string(),
  createdAt: z.iso.datetime(),
});

export const noteListResponseDto = z.array(noteResponseDto);
