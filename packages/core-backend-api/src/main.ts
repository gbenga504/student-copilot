import "dotenv/config";

import type { Server } from "node:http";

import { createApp } from "./app";
import { createAuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { createResolveAuthentication } from "./auth/middleware/authenticate";
import { DrizzleAuthRepository } from "./auth/repositories/drizzle-auth.repository";
import { createNoteController } from "./notes/note.controller";
import { NoteService } from "./notes/note.service";
import { DrizzleNoteRepository } from "./notes/repositories/drizzle-note.repository";
import { JwtAccessTokenProvider } from "./utils/access-token/jwt-access-token";
import { createConfiguration } from "./utils/configuration";
import { createDatabaseConnection } from "./utils/database";
import { createLogger } from "./utils/logger";
import { ResendMailer } from "./utils/mailer/resend-mailer";

const configuration = createConfiguration();
const logger = createLogger(configuration.logLevel);
const databaseConnection = createDatabaseConnection(configuration.databaseUrl);
const accessTokenProvider = new JwtAccessTokenProvider(
  configuration.jwtSecret,
  configuration.jwtExpiresInSeconds
);
const resolveAuthentication = createResolveAuthentication(accessTokenProvider);

// Auth
const authService = new AuthService({
  repository: new DrizzleAuthRepository(databaseConnection.database),
  mailer: new ResendMailer(
    configuration.resendApiKey,
    configuration.authEmailFrom
  ),
  accessTokenProvider,
  configuration: {
    otpHashSecret: configuration.otpHashSecret,
  },
});
const authRouter = createAuthController({ authService });

// Notes
const noteService = new NoteService({
  repository: new DrizzleNoteRepository(databaseConnection.database),
});
const noteRouter = createNoteController({ noteService });

const app = createApp({
  authRouter,
  noteRouter,
  logger,
  resolveAuthentication,
  webOrigin: configuration.webOrigin,
});

const server = app.listen(configuration.port, () => {
  logger.info({ port: configuration.port }, "API listening");
});

registerGracefulShutdown(server);

function registerGracefulShutdown(server: Server): void {
  let isShuttingDown = false;

  async function shutdown(signal: NodeJS.Signals): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info({ signal }, "Graceful shutdown started");

    const forcedShutdown = setTimeout(() => {
      logger.error(
        { timeoutMs: configuration.shutdownTimeoutMs },
        "Graceful shutdown timed out"
      );
      process.exit(1);
    }, configuration.shutdownTimeoutMs);
    forcedShutdown.unref();

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await databaseConnection.close();
      logger.info("Graceful shutdown completed");
    } catch (error) {
      logger.error({ error }, "Graceful shutdown failed");
      process.exitCode = 1;
    } finally {
      clearTimeout(forcedShutdown);
    }
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
