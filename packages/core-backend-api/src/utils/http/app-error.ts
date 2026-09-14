export type ErrorFields = Record<string, string[]>;

export const APP_ERROR_CODES = {
  AUTH_INVALID_LOGIN_CODE: "AUTH_INVALID_LOGIN_CODE",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  EMAIL_DELIVERY_FAILED: "EMAIL_DELIVERY_FAILED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_JSON: "INVALID_JSON",
  NOT_PERMITTED: "NOT_PERMITTED",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  TRANSCRIPTION_UNAVAILABLE: "TRANSCRIPTION_UNAVAILABLE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type AppErrorCode =
  (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: AppErrorCode,
    message: string,
    readonly fields?: ErrorFields,
    readonly data?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}
