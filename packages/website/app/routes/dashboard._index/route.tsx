import { Fragment } from "react";
import { redirect } from "react-router";

import type { Note } from "~/api/notes";
import { requireUser } from "~/libs/auth.server";
import dayjs from "~/libs/dayjs";
import {
  actionWithServerContext,
  loaderWithServerContext,
  type ServerRouteContext,
} from "~/libs/route-api.server";
import { constructURL, ROUTE_IDS } from "~/libs/route-util";

import type { Route } from "../dashboard._index/+types/route";

import { EmptyState } from "./components/empty-state";
import { FilledState, type NoteGroup } from "./components/filled-state";
import { NewNoteButton } from "./components/new-note-button";

export const loader = loaderWithServerContext(
  async ({ api, request }: Route.LoaderArgs & ServerRouteContext) => {
    await requireUser({ api, request });

    return { notes: await api.notes.list() };
  }
);

export const action = actionWithServerContext(
  async ({ api, request }: Route.ActionArgs & ServerRouteContext) => {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "create") {
      const note = await api.notes.create();
      return redirect(
        constructURL({
          routeId: ROUTE_IDS.noteDetailsPage,
          params: { lang: "en", noteId: note.id },
          query: { recording: "auto" },
        })
      );
    }

    if (intent === "delete") {
      const noteId = formData.get("noteId");

      if (typeof noteId !== "string") {
        throw new Response("Note ID is required", { status: 400 });
      }

      await api.notes.delete(noteId);
      return null;
    }

    throw new Response("Unsupported action", { status: 400 });
  }
);

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "My notes" },
    { name: "description", content: "Your notes dashboard" },
  ];
}

export default function DashboardIndexPage({
  loaderData,
}: Route.ComponentProps) {
  const noteGroups = groupNotesByDate(loaderData.notes);
  const hasNotes = noteGroups.length > 0;

  const renderHeader = () => {
    return (
      <header className="flex justify-end px-6 py-4">
        <NewNoteButton />
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

function groupNotesByDate(notes: Note[]): NoteGroup[] {
  const groups = new Map<string, Note[]>();

  for (const note of notes) {
    const date = dayjs(note.createdAt).format("YYYY-MM-DD");
    groups.set(date, [...(groups.get(date) ?? []), note]);
  }

  return Array.from(groups, ([date, groupedNotes]) => ({
    date,
    notes: groupedNotes,
  }));
}
