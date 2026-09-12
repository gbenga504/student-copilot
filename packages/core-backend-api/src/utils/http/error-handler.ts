import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import type { Logger } from "../logger";
import { APP_ERROR_CODES, AppError, type ErrorFields } from "./app-error";

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new AppError(404, APP_ERROR_CODES.ROUTE_NOT_FOUND, "Route not found"));
};

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, request, response, _next) => {
    const normalizedError = normalizeError(error);

    if (normalizedError.statusCode >= 500) {
      logger.error(
        { error, requestId: request.requestId },
        "Request failed unexpectedly"
      );
    }

    response.status(normalizedError.statusCode).json({
      statusCode: normalizedError.statusCode,
      code: normalizedError.code,
      message: normalizedError.message,
      ...(normalizedError.fields && { fields: normalizedError.fields }),
      ...(normalizedError.data !== undefined && { data: normalizedError.data }),
    });
  };
}

function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    const fields: ErrorFields = {};

    for (const issue of error.issues) {
      const field = issue.path.join(".") || "request";
      fields[field] = [...(fields[field] ?? []), issue.message];
    }

    return new AppError(
      400,
      APP_ERROR_CODES.VALIDATION_ERROR,
      "The request is invalid",
      fields
    );
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    return new AppError(
      400,
      APP_ERROR_CODES.INVALID_JSON,
      "The request body is invalid"
    );
  }

  return new AppError(
    500,
    APP_ERROR_CODES.INTERNAL_ERROR,
    "An unexpected error occurred"
  );
}
