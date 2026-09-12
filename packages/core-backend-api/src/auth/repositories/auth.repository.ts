import type { LoginCode } from "../entities/login-code.entity";
import type { User } from "../entities/user.entity";

export type CreateLoginCodeParams = {
  email: string;
  codeHash: string;
  expiresAt: Date;
};

export interface AuthRepository {
  replaceActiveLoginCode(
    params: CreateLoginCodeParams,
    now: Date
  ): Promise<string>;
  deleteLoginCode(id: string): Promise<void>;
  findActiveLoginCode(email: string, now: Date): Promise<LoginCode | null>;
  incrementLoginCodeAttempts(id: string): Promise<void>;
  consumeLoginCodeAndUpsertUser(
    loginCodeId: string,
    email: string,
    now: Date
  ): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  updateUserProfile(id: string, name: string, now: Date): Promise<User | null>;
}
