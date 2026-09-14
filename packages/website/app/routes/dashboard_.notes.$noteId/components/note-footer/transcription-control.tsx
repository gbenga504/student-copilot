import classNames from "classnames";
import { ChevronUp, Minus, MonitorUp, Square } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/button/button";
import type { TranscriptChunk } from "~/api/notes";

import { useNoteTranscription } from "./use-note-transcription";

interface TranscriptionButtonProps {
  autoStart: boolean;
  initialTranscript: TranscriptChunk[];
  noteId: string;
  open: boolean;
  onToggle: () => void;
}

export const TranscriptionControl = ({
  autoStart,
  initialTranscript,
  noteId,
  open,
  onToggle,
}: TranscriptionButtonProps) => {
  const hasAutoStarted = useRef(false);
  const transcriptPanelRef = useRef<HTMLDivElement>(null);
  const {
    barHeights,
    error: recordingError,
    interimTranscript,
    isTabAudioShared,
    shareTabAudio,
    startRecording,
    state: recordingState,
    transcript,
    toggleRecording: handleToggleRecording,
  } = useNoteTranscription({
    initialTranscript,
    noteId,
  });

  useEffect(
    function autoStartAudioRecording() {
      if (!autoStart || hasAutoStarted.current) {
        return;
      }

      hasAutoStarted.current = true;
      startRecording();
    },
    [autoStart, startRecording]
  );

  useEffect(
    function scrollToLatestTranscript() {
      if (!open || !transcriptPanelRef.current) {
        return;
      }

      transcriptPanelRef.current.scrollTop =
        transcriptPanelRef.current.scrollHeight;
    },
    [interimTranscript, open, transcript]
  );

  const renderAudioBars = () => {
    return (
      <span
        className="flex h-7 w-4 items-center justify-between"
        aria-hidden="true"
      >
        {barHeights.map((height, index) => (
          <span
            className="w-0.75 rounded-full bg-current transition-[height] duration-75"
            key={index}
            style={{ height }}
          />
        ))}
      </span>
    );
  };

  const renderHeader = () => {
    return (
      <div className="p-1 flex items-center justify-end">
        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          size="medium"
          className="gap-1 hover:bg-app-gray-150"
          disabled={recordingState !== "recording" || isTabAudioShared}
          aria-pressed={isTabAudioShared}
          onClick={shareTabAudio}
        >
          <MonitorUp size={16} aria-hidden="true" />
          {isTabAudioShared ? "Tab shared" : "Share tab audio"}
        </Button>

        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          shape="circle"
          aria-label="Minimize transcription control"
          className="hover:bg-app-gray-150"
          onClick={onToggle}
        >
          <Minus size={16} />
        </Button>
      </div>
    );
  };

  const renderTranscribedMessagesPanel = () => {
    return (
      <div
        className="scrollbar-hidden flex max-h-120 min-h-15.5 flex-col gap-1 overflow-y-auto border-y border-y-app-gray-150 p-2"
        ref={transcriptPanelRef}
      >
        <p className="mb-2 text-center text-xs">
          Always get consent when transcribing others.
        </p>
        {transcript.map((chunk) => (
          <p
            className="w-fit max-w-[92%] rounded-lg bg-app-gray-150 px-2 py-1 text-sm leading-5 text-white"
            key={chunk.id}
          >
            {chunk.text}
          </p>
        ))}
        {interimTranscript && (
          <p className="w-fit max-w-[92%] rounded-lg bg-app-gray-150/60 px-2 py-1 text-sm leading-5 text-white">
            {interimTranscript}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={classNames(
        "flex flex-col border border-app-gray-150 bg-app-gray-200 p-1",
        {
          "w-full rounded-4xl": open,
          "h-15.5 rounded-full": !open,
        }
      )}
    >
      {open && renderHeader()}
      {open && renderTranscribedMessagesPanel()}

      <div
        className={classNames("flex flex-none items-center", {
          "h-15.5 pt-1": open,
          "h-full": !open,
        })}
      >
        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          size="small"
          className="gap-1 hover:bg-app-gray-150 rounded-l-full h-full"
          onClick={onToggle}
        >
          {renderAudioBars()}
          <ChevronUp
            size={16}
            className={classNames("transition-transform duration-300", {
              "-rotate-180": open,
            })}
          />
        </Button>

        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="primary"
          size="small"
          className="hover:bg-app-gray-150 rounded-r-full h-full font-medium"
          loading={recordingState === "starting"}
          loadingText="Starting"
          aria-label={
            recordingState === "recording" ? "Pause recording" : undefined
          }
          aria-pressed={recordingState === "recording"}
          onClick={handleToggleRecording}
        >
          {recordingState === "recording" ? (
            <Square size={12} fill="currentColor" aria-hidden="true" />
          ) : (
            "Resume"
          )}
        </Button>

        {recordingError && (
          <span className="sr-only" role="status">
            {recordingError}
          </span>
        )}
      </div>
    </div>
  );
};
