import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useFetcher } from "react-router";

import type { Note } from "~/api/notes";
import { Input } from "~/components/input/input";

import { NoteEditor } from "../note-editor/note-editor";

type NoteFormProps = {
  note: Note;
  backAction: React.ReactNode;
  meta: React.ReactNode;
};

type UpdateNoteResponse = { note: Note } | { error: string };

type NoteDraft = {
  title: string;
  content: string;
};

const AUTOSAVE_DELAY_MS = 1000;

export function NoteForm({ note, backAction, meta }: NoteFormProps) {
  const fetcher = useFetcher<UpdateNoteResponse>();
  const submittedDraft = useRef<NoteDraft | null>(null);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [savedTitle, setSavedTitle] = useState(note.title);
  const [savedContent, setSavedContent] = useState(note.content);
  const [failedDraft, setFailedDraft] = useState<NoteDraft | null>(null);
  const isSaving = fetcher.state !== "idle";
  const normalizedTitle = title.trim();
  const hasChanges =
    normalizedTitle !== savedTitle || content !== savedContent;
  const hasSaveError =
    failedDraft?.title === normalizedTitle && failedDraft.content === content;
  const canSave =
    normalizedTitle.length > 0 && hasChanges && !isSaving && !hasSaveError;

  useEffect(
    function trackSavedNote() {
      if (!fetcher.data) {
        return;
      }

      if ("note" in fetcher.data) {
        setSavedTitle(fetcher.data.note.title);
        setSavedContent(fetcher.data.note.content);
        setFailedDraft(null);
        return;
      }

      setFailedDraft(submittedDraft.current);
    },
    [fetcher.data]
  );

  const saveNote = useEffectEvent(() => {
    submittedDraft.current = { title: normalizedTitle, content };
    fetcher.submit(
      { title: normalizedTitle, content },
      { method: "patch", encType: "application/json" }
    );
  });

  useEffect(
    function autosaveNote() {
      if (!canSave) {
        return;
      }

      const timeoutId = window.setTimeout(saveNote, AUTOSAVE_DELAY_MS);
      return () => window.clearTimeout(timeoutId);
    },
    [canSave, content, normalizedTitle]
  );

  const renderSaveStatus = () => {
    let status = "Saved";

    if (isSaving) {
      status = "Saving...";
    } else if (normalizedTitle.length === 0) {
      status = "Title is required";
    } else if (hasSaveError) {
      status = "Could not save changes";
    } else if (hasChanges) {
      status = "Unsaved changes";
    }

    return (
      <span aria-live="polite" className="text-xs text-app-gray-100">
        {status}
      </span>
    );
  };

  const renderEditor = () => {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-6">
        <Input
          aria-label="Note title"
          value={title}
          maxLength={200}
          fullWidth
          classes={{
            inputContainer:
              "border-0 bg-transparent px-0 py-0 focus-within:ring-0",
          }}
          className="font-serif text-3xl text-white"
          onChange={(event) => setTitle(event.target.value)}
        />
        {meta}
        <NoteEditor content={content} onChange={setContent} />
      </main>
    );
  };

  return (
    <>
      <header className="flex items-center justify-between px-20 py-4">
        {backAction}
        {renderSaveStatus()}
      </header>
      {renderEditor()}
    </>
  );
}