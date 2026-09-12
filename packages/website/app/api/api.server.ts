import { authTokenCookie } from "~/libs/auth-cookie.server";
import type { ServerRuntimeConfig } from "~/libs/configuration/server-runtime-config.server";

import { createApiClient } from "./api";

export async function getServerApiClient(
  request: Request,
  serverConfig: ServerRuntimeConfig
) {
  const cookieHeader = request.headers.get("Cookie");
  const accessToken = await authTokenCookie.parse(cookieHeader);

  return createApiClient({
    apiUrl: serverConfig.API_URL.replace(/\/$/, ""),
    accessToken: typeof accessToken === "string" ? accessToken : undefined,
    timeout: Number(serverConfig.API_TIMEOUT_MS),
  });
}
