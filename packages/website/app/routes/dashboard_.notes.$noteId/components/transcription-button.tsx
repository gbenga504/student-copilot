import { AudioLines, ChevronUp } from "lucide-react";

import { Button } from "~/components/button/button";

export const TranscriptionButton = () => {
  return (
    <div className="flex items-center border border-app-gray-150 bg-app-gray-200 rounded-full h-full p-1">
      <Button
        element="button"
        type="button"
        variant="text"
        colorTheme="gray"
        size="small"
        className="gap-1 hover:bg-app-gray-150 rounded-l-full h-full"
      >
        <AudioLines size={20} />
        <ChevronUp size={16} />
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
  );
};
