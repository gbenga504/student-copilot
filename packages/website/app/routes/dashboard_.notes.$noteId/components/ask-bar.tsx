import { Textarea } from "~/components/textarea/textarea";

export const AskBar = () => {
  return (
    <Textarea
      placeholder="Ask anything"
      fullWidth
      classes={{
        container: "rounded-full pl-6 pr-3 h-15",
      }}
    />
  );
};
