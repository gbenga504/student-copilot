import { File } from "lucide-react";
import dayjs from "~/libs/dayjs";

export interface Note {
  id: string;
  title: string;
  author: string;
  createdAt: string;
}

export interface NoteGroup {
  date: string;
  notes: Note[];
}

export const noteGroups: NoteGroup[] = [
  {
    date: new Date().toISOString(),
    notes: [
      {
        id: "summary-of-a-goal-getter",
        title: "Summary of a Goal getter",
        author: "Me",
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

interface FilledStateProps {
  noteGroups: NoteGroup[];
}

export function FilledState({ noteGroups }: FilledStateProps) {
  const renderNoteRow = (note: Note) => {
    return (
      <li
        key={note.id}
        tabIndex={0}
        className="flex cursor-pointer items-center gap-3 rounded-xl p-2 outline-none hover:bg-app-gray-200 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-gray-150">
          <File className="size-4 text-app-gray-100" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base text-white">{note.title}</p>
          <p className="text-sm text-app-gray-100">{note.author}</p>
        </div>
        <span className="shrink-0 text-xs text-app-gray-100">
          {dayjs(note.createdAt).format("HH:mm")}
        </span>
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
        <h2 className="px-2 pt-4 pb-2 text-sm font-bold text-app-gray-100">
          {label}
        </h2>

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
