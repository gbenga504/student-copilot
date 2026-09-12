import { z } from "zod";

const serverEnvironmentSchema = z.object({
  API_PROXY: z.literal("/api").default("/api"),
  API_TIMEOUT_MS: z
    .string()
    .regex(/^[1-9]\d*$/)
    .default("8000"),
  API_URL: z.url().default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerRuntimeConfig = z.infer<typeof serverEnvironmentSchema>;

export function createServerRuntimeConfig(
  environment: NodeJS.ProcessEnv
): ServerRuntimeConfig {
  return serverEnvironmentSchema.parse(environment);
}

export const serverRuntimeConfig = createServerRuntimeConfig(process.env);
