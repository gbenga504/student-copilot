import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

import type { AccessTokenProvider } from "../../utils/access-token/access-token";
import { APP_ERROR_CODES, AppError } from "../../utils/http/app-error";

const authenticatedUserSchema = z.object({
  sub: z.uuid(),
  email: z.email(),
});
const AUTH_TOKEN_COOKIE_NAME = "authToken";

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export type AuthenticatedRequest = Request & {
  authenticatedUser: AuthenticatedUser;
};

export type AuthenticatedRequestHandler = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => void | Promise<void>;

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
    }
  }
}

export function createResolveAuthentication(
  accessTokenProvider: AccessTokenProvider
): RequestHandler {
  return (request, _response, next) => {
    const authorization = request.headers.authorization;
    const [scheme, bearerToken] = authorization?.split(" ") ?? [];

    if (authorization && (scheme !== "Bearer" || !bearerToken)) {
      next(unauthorizedError());
      return;
    }

    const cookieToken = request.cookies[AUTH_TOKEN_COOKIE_NAME];
    const token = bearerToken ?? cookieToken;

    if (!token) {
      next();
      return;
    }

    if (typeof token !== "string") {
      next(unauthorizedError());
      return;
    }

    try {
      const payload = accessTokenProvider.verify(token);
      request.authenticatedUser = authenticatedUserSchema.parse(payload);
      next();
    } catch {
      next(unauthorizedError());
    }
  };
}

export const requireAuthentication: RequestHandler = (
  request,
  _response,
  next
) => {
  if (!request.authenticatedUser) {
    next(unauthorizedError());
    return;
  }

  next();
};

export function authenticatedHandler(
  handler: AuthenticatedRequestHandler
): RequestHandler {
  return (request, response, next) =>
    handler(request as AuthenticatedRequest, response, next);
}

function unauthorizedError(): AppError {
  return new AppError(
    401,
    APP_ERROR_CODES.AUTH_UNAUTHORIZED,
    "Authentication required"
  );
}
