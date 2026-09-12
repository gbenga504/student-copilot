import jwt from "jsonwebtoken";

import type {
  AccessTokenProvider,
  CreateAccessTokenParams,
} from "./access-token";

export class JwtAccessTokenProvider implements AccessTokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number
  ) {}

  create(params: CreateAccessTokenParams): string {
    return jwt.sign(params.claims, this.secret, {
      algorithm: "HS256",
      expiresIn: this.expiresInSeconds,
      subject: params.subject,
    });
  }

  verify(token: string): Record<string, unknown> {
    const payload = jwt.verify(token, this.secret, {
      algorithms: ["HS256"],
    });

    if (typeof payload === "string") {
      throw new Error("The access token payload is invalid");
    }

    return payload;
  }
}
