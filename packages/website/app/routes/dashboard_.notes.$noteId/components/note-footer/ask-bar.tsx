import { Mic } from "lucide-react";

import { Button } from "~/components/button/button";
import { Textarea } from "~/components/textarea/textarea";

export const AskBar = () => {
  return (
    <Textarea
      placeholder="Ask anything"
      fullWidth
      classes={{
        container: "rounded-full pl-6 pr-3 h-auto",
      }}
      endAdornment={
        <Button
          element="button"
          type="button"
          variant="outlined"
          colorTheme="gray"
          shape="circle"
          aria-label="Record audio"
          className="hover:bg-app-gray-150"
        >
          <Mic size={16} />
        </Button>
      }
    />
  );
};
