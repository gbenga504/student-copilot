import { z } from "zod";

const environmentSchema = z.object({
  AUTH_EMAIL_FROM: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DEEPGRAM_API_KEY: z.string().min(1),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(2_592_000),
  JWT_SECRET: z.string().min(16),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  OTP_HASH_SECRET: z.string().min(16),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  RESEND_API_KEY: z.string().min(1),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
});

export type Configuration = {
  authEmailFrom: string;
  databaseUrl: string;
  deepgramApiKey: string;
  jwtExpiresInSeconds: number;
  jwtSecret: string;
  logLevel: string;
  otpHashSecret: string;
  port: number;
  resendApiKey: string;
  shutdownTimeoutMs: number;
  webOrigin: string;
};

export function createConfiguration(
  environment: NodeJS.ProcessEnv = process.env
): Configuration {
  const parsed = environmentSchema.parse(environment);

  return {
    authEmailFrom: parsed.AUTH_EMAIL_FROM,
    databaseUrl: parsed.DATABASE_URL,
    deepgramApiKey: parsed.DEEPGRAM_API_KEY,
    jwtExpiresInSeconds: parsed.JWT_EXPIRES_IN_SECONDS,
    jwtSecret: parsed.JWT_SECRET,
    logLevel: parsed.LOG_LEVEL,
    otpHashSecret: parsed.OTP_HASH_SECRET,
    port: parsed.PORT,
    resendApiKey: parsed.RESEND_API_KEY,
    shutdownTimeoutMs: parsed.SHUTDOWN_TIMEOUT_MS,
    webOrigin: parsed.WEB_ORIGIN,
  };
}
