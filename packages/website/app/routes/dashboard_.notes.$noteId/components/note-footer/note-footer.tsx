import { useState } from "react";

import { AskBar } from "./ask-bar";
import { TranscriptionControl } from "./transcription-control";

type NoteFooterProps = {
  autoStartRecording: boolean;
};

export const NoteFooter = ({ autoStartRecording }: NoteFooterProps) => {
  const [isTranscriptionControlOpen, setIsTranscriptionControlOpen] =
    useState(false);

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-6 py-4 pb-8">
      <TranscriptionControl
        autoStart={autoStartRecording}
        open={isTranscriptionControlOpen}
        onToggle={() => setIsTranscriptionControlOpen((isOpen) => !isOpen)}
      />

      {!isTranscriptionControlOpen && <AskBar />}
    </div>
  );
};
