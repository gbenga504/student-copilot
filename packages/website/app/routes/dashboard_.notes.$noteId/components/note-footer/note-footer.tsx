import { useState } from "react";

import { AskBar } from "./ask-bar";
import { TranscriptionControl } from "./transcription-control";

export const NoteFooter = () => {
  const [isTranscriptionControlOpen, setIsTranscriptionControlOpen] =
    useState(false);

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-6 py-4 pb-8">
      <TranscriptionControl
        open={isTranscriptionControlOpen}
        onToggle={() => setIsTranscriptionControlOpen((isOpen) => !isOpen)}
      />

      {!isTranscriptionControlOpen && <AskBar />}
    </div>
  );
};
