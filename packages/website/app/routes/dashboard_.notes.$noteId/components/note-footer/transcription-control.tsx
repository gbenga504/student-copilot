import classNames from "classnames";
import { ChevronUp, Minus, Square } from "lucide-react";

import { Button } from "~/components/button/button";
import {
  type AudioBarHeights,
  useAudioVisualizer,
} from "~/hooks/use-audio-visualizer";

const IDLE_BAR_HEIGHTS: AudioBarHeights = [10, 22, 16];
const ACTIVE_MIN_BAR_HEIGHTS: AudioBarHeights = [4, 7, 5];
const ACTIVE_MAX_BAR_HEIGHTS: AudioBarHeights = [21, 28, 24];

interface TranscriptionButtonProps {
  open: boolean;
  onToggle: () => void;
}

export const TranscriptionControl = ({
  open,
  onToggle,
}: TranscriptionButtonProps) => {
  const {
    barHeights,
    error: recordingError,
    state: recordingState,
    toggleRecording: handleToggleRecording,
  } = useAudioVisualizer({
    idleBarHeights: IDLE_BAR_HEIGHTS,
    activeMinBarHeights: ACTIVE_MIN_BAR_HEIGHTS,
    activeMaxBarHeights: ACTIVE_MAX_BAR_HEIGHTS,
  });

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
      <div className="p-1 flex justify-end">
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
      <div className="p-2 max-h-120 min-h-15 border-y border-y-app-gray-150">
        <p className="text-xs text-center">
          Always get consent when transcribing others.
        </p>
      </div>
    );
  };

  return (
    <div
      className={classNames(
        "flex flex-col border border-app-gray-150 bg-app-gray-200 h-full p-1",
        {
          "w-full rounded-4xl": open,
          "rounded-full": !open,
        }
      )}
    >
      {open && renderHeader()}
      {open && renderTranscribedMessagesPanel()}

      <div
        className={classNames("flex items-center h-full min-h-15", {
          "pt-1": open,
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
