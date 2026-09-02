import { Plus } from "lucide-react";
import { Fragment } from "react";
import { Button } from "~/components/button/button";
import type { Route } from "../dashboard._index/+types/route";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "My notes" },
    { name: "description", content: "Your notes dashboard" },
  ];
}

export default function DashboardIndexPage() {
  const renderHeader = () => {
    return (
      <header className="flex justify-end px-6 py-4">
        <Button
          element="button"
          type="button"
          variant="contained"
          colorTheme="primary"
        >
          <Plus className="size-4" />
          New note
        </Button>
      </header>
    );
  };

  return <Fragment>{renderHeader()}</Fragment>;
}
