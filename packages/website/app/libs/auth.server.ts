import { redirect } from "react-router";

import type { ApiClient } from "~/api/api";
import type { User } from "~/api/auth";
import { ApiError } from "~/errors/api-error";
import { authTokenCookie } from "~/libs/auth-cookie.server";

export { authTokenCookie } from "~/libs/auth-cookie.server";

type AuthServerContext = {
  api: ApiClient;
  request: Request;
};

type AuthenticatedUser = User & {
  name: string;
  requiresName: false;
};

export async function getOptionalUser({
  api,
  request,
}: AuthServerContext): Promise<User | null> {
  const token = await authTokenCookie.parse(request.headers.get("Cookie"));

  if (typeof token !== "string" || !token) {
    return null;
  }

  try {
    return await api.auth.getCurrentUser();
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.statusCode === 401 || error.statusCode === 404)
    ) {
      return null;
    }

    throw error;
  }
}

export async function requireUser(
  context: AuthServerContext
): Promise<AuthenticatedUser> {
  const user = await getOptionalUser(context);

  if (!user) {
    throw redirect("/", {
      headers: {
        "Set-Cookie": await authTokenCookie.serialize("", { maxAge: 0 }),
      },
    });
  }

  if (user.requiresName || !user.name) {
    throw redirect("/");
  }

  return { ...user, name: user.name, requiresName: false };
}
