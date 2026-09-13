import { Router } from "express";

import {
  authenticatedHandler,
  requireAuthentication,
} from "../auth/middleware/authenticate";
import { noteListResponseDto, noteParamsDto, noteResponseDto } from "./dtos/note.dto";
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