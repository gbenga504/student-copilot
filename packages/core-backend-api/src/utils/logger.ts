import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { RequestHandler } from "express";
import pino, { type Logger as PinoLogger } from "pino";

export type Logger = Pick<PinoLogger, "error" | "info" | "warn">;

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function createLogger(level: string): Logger {
  return pino({
    level,
    base: { service: "core-backend-api" },
  });
}

export function createRequestLogger(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const requestId = request.get("x-request-id")?.trim() || randomUUID();
    const method = request.method;
    const path = request.path;
    const startedAt = performance.now();
    let responseFinished = false;

    request.requestId = requestId;
    response.setHeader("x-request-id", requestId);

    logger.info(
      {
        request: {
          id: requestId,
          ip: request.ip,
          method,
          path,
          userAgent: request.get("user-agent"),
        },
      },
      "HTTP request received"
    );

    response.once("finish", () => {
      responseFinished = true;
      const context = {
        request: {
          id: requestId,
          method,
          path,
        },
        response: {
          contentLength: response.getHeader("content-length"),
          durationMs: Number((performance.now() - startedAt).toFixed(2)),
          statusCode: response.statusCode,
        },
      };

      if (response.statusCode >= 500) {
        logger.error(context, "HTTP request completed");
      } else if (response.statusCode >= 400) {
        logger.warn(context, "HTTP request completed");
      } else {
        logger.info(context, "HTTP request completed");
      }
    });

    response.once("close", () => {
      if (!responseFinished) {
        logger.warn(
          {
            request: {
              id: requestId,
              method,
              path,
            },
            durationMs: Number((performance.now() - startedAt).toFixed(2)),
          },
          "HTTP request aborted"
        );
      }
    });

    next();
  };
}
