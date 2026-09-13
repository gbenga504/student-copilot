import { Plus } from "lucide-react";
import { Form, useNavigation } from "react-router";

import { Button } from "~/components/button/button";

type NewNoteButtonProps = {
  colorTheme?: "primary" | "gray";
};

export function NewNoteButton({
  colorTheme = "primary",
}: NewNoteButtonProps) {
  const navigation = useNavigation();
  const isCreating =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "create";

  return (
    <Form method="post">
      <Button
        element="button"
        type="submit"
        name="intent"
        value="create"
        variant="contained"
        colorTheme={colorTheme}
        loading={isCreating}
        loadingText="Creating"
      >
        <Plus className="size-4" />
        New note
      </Button>
    </Form>
  );
}