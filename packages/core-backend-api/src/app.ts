import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type Express,
  type RequestHandler,
  type Router,
} from "express";

import { createHealthController } from "./health/health.controller";
import {
  createErrorHandler,
  notFoundHandler,
} from "./utils/http/error-handler";
import { createRequestLogger, type Logger } from "./utils/logger";

export type AppDependencies = {
  authRouter: Router;
  logger: Logger;
  resolveAuthentication: RequestHandler;
  webOrigin: string;
};

export function createApp(dependencies: AppDependencies): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(createRequestLogger(dependencies.logger));
  app.use(cors({ origin: dependencies.webOrigin }));
  app.use(cookieParser());
  app.use(dependencies.resolveAuthentication);
  app.use(express.json());
  app.use("/health", createHealthController());
  app.use("/auth", dependencies.authRouter);
  app.use(notFoundHandler);
  app.use(createErrorHandler(dependencies.logger));

  return app;
}
