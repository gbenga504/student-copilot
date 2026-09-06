import { AudioLines, ChevronDown, ChevronUp, Minus } from "lucide-react";
import classNames from "classnames";

import { Button } from "~/components/button/button";

interface TranscriptionButtonProps {
  open: boolean;
  onToggle: () => void;
}

export const TranscriptionControl = ({
  open,
  onToggle,
}: TranscriptionButtonProps) => {
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
        },
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
          <AudioLines size={20} />
          {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </Button>

        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="primary"
          size="small"
          className="hover:bg-app-gray-150 rounded-r-full h-full font-medium"
        >
          Resume
        </Button>
      </div>
    </div>
  );
};
