import { File } from "lucide-react";
import { Link } from "react-router";

import type { Note } from "~/api/notes";
import dayjs from "~/libs/dayjs";
import { constructURL, ROUTE_IDS } from "~/libs/route-util";

import { NoteActions } from "./note-actions";

export type NoteGroup = {
  date: string;
  notes: Note[];
};

interface FilledStateProps {
  noteGroups: NoteGroup[];
}

export function FilledState({ noteGroups }: FilledStateProps) {
  const renderNoteRow = (note: Note) => {
    return (
      <li key={note.id} className="group relative">
        <Link
          to={constructURL({
            routeId: ROUTE_IDS.noteDetailsPage,
            params: { lang: "en", noteId: note.id },
          })}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 outline-none hover:bg-app-gray-200 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-gray-150">
            <File className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base text-white">{note.title}</p>
            <p className="text-sm">Me</p>
          </div>
          <span className="shrink-0 text-xs transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">
            {dayjs(note.createdAt).format("HH:mm")}
          </span>
        </Link>
        <NoteActions noteId={note.id} noteTitle={note.title} />
      </li>
    );
  };

  const renderNoteGroup = (noteGroup: NoteGroup) => {
    const label = dayjs(noteGroup.date).calendar(null, {
      sameDay: "[Today]",
      nextDay: "[Tomorrow]",
      nextWeek: "dddd",
      lastDay: "[Yesterday]",
      lastWeek: "[Last] dddd",
      sameElse: "dddd, MMMM D",
    });

    return (
      <section key={noteGroup.date} className="flex flex-col">
        <h2 className="px-2 pt-4 pb-2 text-sm font-bold">{label}</h2>

        <ul className="flex list-none flex-col">
          {noteGroup.notes.map((note) => renderNoteRow(note))}
        </ul>
      </section>
    );
  };

  return (
    <div className="flex flex-col justify-betwen w-full">
      <div className="flex-1">
        {noteGroups.map((noteGroup) => renderNoteGroup(noteGroup))}
      </div>
    </div>
  );
}
