import { Calendar, ChevronLeft, Home, Users } from "lucide-react";

import { Button } from "~/components/button/button";
import { requireUser } from "~/libs/auth.server";
import dayjs from "~/libs/dayjs";
import {
  actionWithServerContext,
  loaderWithServerContext,
  type ServerRouteContext,
} from "~/libs/route-api.server";
import { constructURL, ROUTE_IDS } from "~/libs/route-util";

import type { Route } from "./+types/route";
import { NoteFooter } from "./components/note-footer/note-footer";
import { NoteForm } from "./components/note-form/note-form";

export const loader = loaderWithServerContext(
  async ({ api, params, request }: Route.LoaderArgs & ServerRouteContext) => {
    await requireUser({ api, request });

    return { note: await api.notes.get(params.noteId) };
  }
);

export const action = actionWithServerContext(
  async ({ api, params, request }: Route.ActionArgs & ServerRouteContext) => {
    const body = await request.json();
    const note = await api.notes.update(params.noteId, {
      title: body.title,
      content: body.content,
    });

    return { note };
  }
);

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: loaderData?.note.title ?? "Note" }];
}

export default function NoteDetailsPage({ loaderData }: Route.ComponentProps) {
  const { note } = loaderData;

  const renderBackButton = () => {
    return (
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
          Me
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-app-gray-300">
      <NoteForm
        key={note.id}
        note={note}
        backAction={renderBackButton()}
        meta={renderMeta()}
      />

      <NoteFooter />
    </div>
  );
}
