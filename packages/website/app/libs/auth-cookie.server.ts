import { createCookie } from "react-router";

import { serverRuntimeConfig } from "~/libs/configuration/server-runtime-config.server";

export const authTokenCookie = createCookie("authToken", {
  httpOnly: true,
  maxAge: 2_592_000,
  path: "/",
  sameSite: "lax",
  secure: serverRuntimeConfig.NODE_ENV === "production",
});
