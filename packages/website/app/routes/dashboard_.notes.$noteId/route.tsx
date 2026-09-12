import { Calendar, ChevronLeft, Home, Users } from "lucide-react";
import { useParams } from "react-router";

import { Button } from "~/components/button/button";
import { getNoteByIdOrThrow } from "~/data/notes";
import { requireUser } from "~/libs/auth.server";
import dayjs from "~/libs/dayjs";
import {
  loaderWithServerContext,
  type ServerRouteContext,
} from "~/libs/route-api.server";
import { constructURL, ROUTE_IDS } from "~/libs/route-util";

import type { Route } from "./+types/route";
import { NoteEditor } from "./components/note-editor/note-editor";
import { NoteFooter } from "./components/note-footer/note-footer";

export const loader = loaderWithServerContext(
  async ({ api, request }: Route.LoaderArgs & ServerRouteContext) => {
    await requireUser({ api, request });

    return null;
  }
);

export function meta({ params }: Route.MetaArgs) {
  const note = getNoteByIdOrThrow(params.noteId);

  return [{ title: note?.title ?? "Note" }];
}

export default function NoteDetailsPage() {
  const { noteId } = useParams();
  const note = getNoteByIdOrThrow(noteId);

  const renderHeader = () => {
    return (
      <header className="flex items-center justify-between px-20 py-4">
        <Button
          element="link"
          to={constructURL({
            routeId: ROUTE_IDS.dashboardHomePage,
            params: { lang: "en" },
          })}
          variant="outlined"
          colorTheme="gray"
          size="large"
          className="gap-1.5 rounded-full px-3"
        >
          <ChevronLeft className="size-4" />
          <Home className="size-4" />
        </Button>
      </header>
    );
  };

  const renderMeta = () => {
    return (
      <div className="flex items-center w-max rounded-full border border-app-gray-150">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Calendar className="size-3.5" />
          {dayjs(note.createdAt).format("D MMM")}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Users className="size-3.5" />
          {note.author}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-6">
        <h1 className="font-serif text-3xl text-white">{note.title}</h1>
        {renderMeta()}

        <NoteEditor content={note.content} />
      </main>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-app-gray-300">
      {renderHeader()}
      {renderContent()}

      <NoteFooter />
    </div>
  );
}
