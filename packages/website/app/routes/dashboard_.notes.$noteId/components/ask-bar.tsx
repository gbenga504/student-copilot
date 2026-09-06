import { Input } from "~/components/input/input";

export const AskBar = () => {
  return (
    <Input
      fullWidth
      placeholder="Ask anything"
      className="text-base"
      classes={{
        inputContainer: "rounded-full h-15 pl-6 pr-3",
      }}
    />
  );
};
