import { Router } from "express";

import type { AuthService } from "./auth.service";
import {
  requestCodeRequestDto,
  requestCodeResponseDto,
} from "./dtos/request-code.dto";
import {
  getCurrentUserResponseDto,
  updateUserProfileRequestDto,
} from "./dtos/user.dto";
import {
  verifyCodeRequestDto,
  verifyCodeResponseDto,
} from "./dtos/verify-code.dto";
import {
  authenticatedHandler,
  requireAuthentication,
} from "./middleware/authenticate";

export type AuthControllerDependencies = {
  authService: AuthService;
};

export function createAuthController(
  dependencies: AuthControllerDependencies
): Router {
  const router = Router();

  router.post("/request-code", async (request, response) => {
    const body = requestCodeRequestDto.parse(request.body);
    await dependencies.authService.requestCode(body.email);

    response.json(requestCodeResponseDto.parse({ sent: true }));
  });

  router.post("/verify-code", async (request, response) => {
    const body = verifyCodeRequestDto.parse(request.body);
    const result = await dependencies.authService.verifyCode(
      body.email,
      body.code
    );

    response.json(verifyCodeResponseDto.parse(result));
  });

  router.get(
    "/me",
    requireAuthentication,
    authenticatedHandler(async (request, response) => {
      const user = await dependencies.authService.getUser(
        request.authenticatedUser.sub
      );

      response.json(
        getCurrentUserResponseDto.parse({
          id: user.id,
          email: user.email,
          name: user.name,
          requiresName: !user.profileCompletedAt,
        })
      );
    })
  );

  router.patch(
    "/me",
    requireAuthentication,
    authenticatedHandler(async (request, response) => {
      const body = updateUserProfileRequestDto.parse(request.body);
      const user = await dependencies.authService.updateUserProfile(
        request.authenticatedUser.sub,
        body.name
      );

      response.json(
        getCurrentUserResponseDto.parse({
          id: user.id,
          email: user.email,
          name: user.name,
          requiresName: !user.profileCompletedAt,
        })
      );
    })
  );

  return router;
}
