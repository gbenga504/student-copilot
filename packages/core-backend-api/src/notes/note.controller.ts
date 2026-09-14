import { Router } from "express";

import {
  authenticatedHandler,
  requireAuthentication,
} from "../auth/middleware/authenticate";
import {
  appendTranscriptRequestDto,
  noteListResponseDto,
  noteParamsDto,
  noteResponseDto,
  transcriptionTokenResponseDto,
  transcriptChunkListResponseDto,
  updateNoteRequestDto,
} from "./dtos/note.dto";
import type { NoteService } from "./note.service";

export type NoteControllerDependencies = {
  noteService: NoteService;
};

export function createNoteController(
  dependencies: NoteControllerDependencies
): Router {
  const router = Router();

  router.use(requireAuthentication);

  router.post(
    "/",
    authenticatedHandler(async (request, response) => {
      const note = await dependencies.noteService.create(
        request.authenticatedUser.sub
      );

      response.status(201).json(noteResponseDto.parse(serializeNote(note)));
    })
  );

  router.get(
    "/",
    authenticatedHandler(async (request, response) => {
      const notes = await dependencies.noteService.list(
        request.authenticatedUser.sub
      );

      response.json(noteListResponseDto.parse(notes.map(serializeNote)));
    })
  );

  router.get(
    "/:noteId/transcript",
    authenticatedHandler(async (request, response) => {
      const { noteId } = noteParamsDto.parse(request.params);
      const chunks = await dependencies.noteService.getTranscript(
        request.authenticatedUser.sub,
        noteId
      );

      response.json(
        transcriptChunkListResponseDto.parse(
          chunks.map((chunk) => ({
            ...chunk,
            createdAt: chunk.createdAt.toISOString(),
          }))
        )
      );
    })
  );

  router.post(
    "/:noteId/transcript",
    authenticatedHandler(async (request, response) => {
      const { noteId } = noteParamsDto.parse(request.params);
      const { chunks } = appendTranscriptRequestDto.parse(request.body);
      await dependencies.noteService.appendTranscript(
        request.authenticatedUser.sub,
        { noteId, chunks }
      );

      response.status(204).send();
    })
  );

  router.post(
    "/:noteId/transcription-token",
    authenticatedHandler(async (request, response) => {
      const { noteId } = noteParamsDto.parse(request.params);
      const token = await dependencies.noteService.createTranscriptionToken(
        request.authenticatedUser.sub,
        noteId
      );

      response.json(transcriptionTokenResponseDto.parse(token));
    })
  );

  router.get(
    "/:noteId",
    authenticatedHandler(async (request, response) => {
      const { noteId } = noteParamsDto.parse(request.params);
      const note = await dependencies.noteService.get(
        request.authenticatedUser.sub,
        noteId
      );

      response.json(noteResponseDto.parse(serializeNote(note)));
    })
  );

  router.patch(
    "/:noteId",
    authenticatedHandler(async (request, response) => {
      const { noteId } = noteParamsDto.parse(request.params);
      const { title, content } = updateNoteRequestDto.parse(request.body);
      const note = await dependencies.noteService.update(
        request.authenticatedUser.sub,
        { noteId, title, content }
      );

      response.json(noteResponseDto.parse(serializeNote(note)));
    })
  );

  router.delete(
    "/:noteId",
    authenticatedHandler(async (request, response) => {
      const { noteId } = noteParamsDto.parse(request.params);
      await dependencies.noteService.delete(
        request.authenticatedUser.sub,
        noteId
      );

      response.status(204).send();
    })
  );

  return router;
}

function serializeNote(note: {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}) {
  return { ...note, createdAt: note.createdAt.toISOString() };
}
