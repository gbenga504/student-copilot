import { useState } from "react";

import type { TranscriptChunk } from "~/api/notes";

import { AskBar } from "./ask-bar";
import { TranscriptionControl } from "./transcription-control";

type NoteFooterProps = {
  autoStartRecording: boolean;
  initialTranscript: TranscriptChunk[];
  noteId: string;
};

export const NoteFooter = ({
  autoStartRecording,
  initialTranscript,
  noteId,
}: NoteFooterProps) => {
  const [isTranscriptionControlOpen, setIsTranscriptionControlOpen] =
    useState(false);

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-6 py-4 pb-8">
      <TranscriptionControl
        autoStart={autoStartRecording}
        initialTranscript={initialTranscript}
        noteId={noteId}
        open={isTranscriptionControlOpen}
        onToggle={() => setIsTranscriptionControlOpen((isOpen) => !isOpen)}
      />

      {!isTranscriptionControlOpen && <AskBar />}
    </div>
  );
};
