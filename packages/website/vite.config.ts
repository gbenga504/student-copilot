import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

import { createServerRuntimeConfig } from "./app/libs/configuration/server-runtime-config.server.js";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  const serverConfig = createServerRuntimeConfig({
    ...environment,
    NODE_ENV: mode,
  });

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      proxy: {
        [serverConfig.API_PROXY]: {
          changeOrigin: true,
          rewrite: (path) => path.slice(serverConfig.API_PROXY.length) || "/",
          target: serverConfig.API_URL,
        },
      },
    },
  };
});
