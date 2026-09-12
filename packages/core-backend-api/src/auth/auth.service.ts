import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import type { AccessTokenProvider } from "../utils/access-token/access-token";
import { APP_ERROR_CODES, AppError } from "../utils/http/app-error";
import type { Mailer } from "../utils/mailer/mailer";
import { MailerError } from "../utils/mailer/mailer";
import type { User } from "./entities/user.entity";
import type { AuthRepository } from "./repositories/auth.repository";

const CODE_LIFETIME_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type AuthServiceConfiguration = {
  otpHashSecret: string;
};

export type AuthServiceDependencies = {
  repository: AuthRepository;
  mailer: Mailer;
  accessTokenProvider: AccessTokenProvider;
  configuration: AuthServiceConfiguration;
};

export class AuthService {
  constructor(private readonly dependencies: AuthServiceDependencies) {}

  async requestCode(email: string): Promise<void> {
    const now = new Date();

    const code = randomInt(100_000, 1_000_000).toString();
    const loginCodeId =
      await this.dependencies.repository.replaceActiveLoginCode(
        {
          email,
          codeHash: this.hashCode(email, code),
          expiresAt: new Date(now.getTime() + CODE_LIFETIME_MS),
        },
        now
      );

    try {
      await this.dependencies.mailer.sendEmail({
        to: email,
        subject: "Your Student Copilot login code",
        text: `Your login code is ${code}. It expires in 5 minutes.`,
      });
    } catch (error) {
      await this.dependencies.repository.deleteLoginCode(loginCodeId);

      if (error instanceof MailerError) {
        throw new AppError(
          503,
          APP_ERROR_CODES.EMAIL_DELIVERY_FAILED,
          "Unable to send the login code"
        );
      }

      throw error;
    }
  }

  async verifyCode(
    email: string,
    code: string
  ): Promise<{ accessToken: string; requiresName: boolean }> {
    const now = new Date();
    const loginCode = await this.dependencies.repository.findActiveLoginCode(
      email,
      now
    );

    if (!loginCode || loginCode.attempts >= MAX_ATTEMPTS) {
      throw this.invalidCodeError();
    }

    if (!this.codeMatches(loginCode.codeHash, this.hashCode(email, code))) {
      await this.dependencies.repository.incrementLoginCodeAttempts(
        loginCode.id
      );

      throw this.invalidCodeError();
    }

    const user =
      await this.dependencies.repository.consumeLoginCodeAndUpsertUser(
        loginCode.id,
        email,
        now
      );

    if (!user) {
      throw this.invalidCodeError();
    }

    const accessToken = this.dependencies.accessTokenProvider.create({
      subject: user.id,
      claims: { email: user.email },
    });

    return { accessToken, requiresName: !user.profileCompletedAt };
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.dependencies.repository.findUserById(userId);

    if (!user) {
      throw new AppError(
        404,
        APP_ERROR_CODES.RESOURCE_NOT_FOUND,
        "User cannot be found"
      );
    }

    return user;
  }

  async updateUserProfile(userId: string, name: string): Promise<User> {
    const normalizedName = name.replace(/\s+/g, " ");
    const user = await this.dependencies.repository.updateUserProfile(
      userId,
      normalizedName,
      new Date()
    );

    if (!user) {
      throw new AppError(
        404,
        APP_ERROR_CODES.RESOURCE_NOT_FOUND,
        "User cannot be found"
      );
    }

    return user;
  }

  private hashCode(email: string, code: string): string {
    return createHmac("sha256", this.dependencies.configuration.otpHashSecret)
      .update(`${email}:${code}`)
      .digest("hex");
  }

  private codeMatches(expectedHash: string, actualHash: string): boolean {
    const expected = Buffer.from(expectedHash, "hex");
    const actual = Buffer.from(actualHash, "hex");

    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }

  private invalidCodeError(): AppError {
    return new AppError(
      400,
      APP_ERROR_CODES.AUTH_INVALID_LOGIN_CODE,
      "Invalid or expired login code"
    );
  }
}
