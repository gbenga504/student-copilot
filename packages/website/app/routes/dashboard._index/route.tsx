import { Plus } from "lucide-react";
import { Fragment } from "react";

import { Button } from "~/components/button/button";
import { noteGroups } from "~/data/notes";

import type { Route } from "../dashboard._index/+types/route";

import { EmptyState } from "./components/empty-state";
import { FilledState } from "./components/filled-state";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "My notes" },
    { name: "description", content: "Your notes dashboard" },
  ];
}

export default function DashboardIndexPage() {
  const hasNotes = noteGroups.length > 0;

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

  const renderMainContent = () => {
    return (
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 w-full max-w-2xl mx-auto">
          {hasNotes ? <FilledState noteGroups={noteGroups} /> : <EmptyState />}
        </div>
      </main>
    );
  };

  return (
    <Fragment>
      {renderHeader()}
      {renderMainContent()}
    </Fragment>
  );
}
