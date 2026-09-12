import { z } from "zod";

const environmentSchema = z.enum(["development", "test", "production"]);

const publicRuntimeConfigSchema = z.object({
  API_PROXY: z.literal("/api").default("/api"),
  API_TIMEOUT_MS: z
    .string()
    .regex(/^[1-9]\d*$/)
    .default("8000"),
  NODE_ENV: environmentSchema.default("development"),
});

export type PublicRuntimeConfig = z.infer<typeof publicRuntimeConfigSchema>;

declare global {
  interface Window {
    ENV?: PublicRuntimeConfig;
  }
}

function getPublicRuntimeConfig() {
  if (import.meta.env.SSR) {
    return publicRuntimeConfigSchema.parse(process.env);
  }

  if (!window.ENV) {
    throw new Error("Public runtime configuration has not been initialized");
  }

  return publicRuntimeConfigSchema.parse(window.ENV);
}

export const publicRuntimeConfig = getPublicRuntimeConfig();
