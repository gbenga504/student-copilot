import { Form, Outlet, redirect } from "react-router";

import { Button } from "~/components/button/button";
import { authTokenCookie, requireUser } from "~/libs/auth.server";
import {
  loaderWithServerContext,
  type ServerRouteContext,
} from "~/libs/route-api.server";
import { Sidebar } from "~/routes/dashboard/components/sidebar";

import type { Route } from "./+types/route";

export const loader = loaderWithServerContext(
  async ({ api, request }: Route.LoaderArgs & ServerRouteContext) => {
    return { user: await requireUser({ api, request }) };
  }
);

export async function action() {
  return redirect("/", {
    headers: {
      "Set-Cookie": await authTokenCookie.serialize("", { maxAge: 0 }),
    },
  });
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex h-screen bg-app-gray-300">
      <Sidebar
        userName={loaderData.user.name}
        logoutAction={
          <Form method="post">
            <Button
              element="button"
              type="submit"
              variant="text"
              colorTheme="gray"
              size="small"
            >
              Log out
            </Button>
          </Form>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
