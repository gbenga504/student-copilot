export interface Note {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  content: string;
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
        content:
          "<p>I have been waiting for this to happen but it is a bit odd</p>",
      },
    ],
  },
];

export function getNoteByIdOrThrow(id: string | undefined): Note {
  for (const noteGroup of noteGroups) {
    const matchingNote = noteGroup.notes.find(
      (candidateNote) => candidateNote.id === id
    );

    if (matchingNote) {
      return matchingNote;
    }
  }

  throw new Error("Note not found");
}
