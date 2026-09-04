import { Mic } from "lucide-react";
import { Button } from "~/components/button/button";
import { Input } from "~/components/input/input";

export function AskBar() {
  return (
    <div className="border-t border-app-gray-200 px-6 py-4">
      <div className="relative flex items-center">
        <Input
          fullWidth
          placeholder="Ask anything"
          className="pr-12"
          classes={{
            inputContainer: "rounded-full border-app-gray-200 bg-app-gray-200",
          }}
        />
        <Button
          element="button"
          type="button"
          variant="text"
          colorTheme="gray"
          shape="circle"
          size="small"
          className="absolute top-1/2 right-2 -translate-y-1/2"
        >
          <Mic className="size-4" />
        </Button>
      </div>
    </div>
  );
}
