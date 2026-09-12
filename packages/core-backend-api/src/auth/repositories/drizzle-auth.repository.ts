import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";

import type { Database } from "../../utils/database";
import type { LoginCode } from "../entities/login-code.entity";
import type { User } from "../entities/user.entity";
import type { AuthRepository, CreateLoginCodeParams } from "./auth.repository";
import { loginCodes, users } from "./auth.schema";

export class DrizzleAuthRepository implements AuthRepository {
  constructor(private readonly database: Database) {}

  async replaceActiveLoginCode(
    params: CreateLoginCodeParams,
    now: Date
  ): Promise<string> {
    return this.database.transaction(async (transaction) => {
      await transaction
        .update(loginCodes)
        .set({ consumedAt: now })
        .where(
          and(eq(loginCodes.email, params.email), isNull(loginCodes.consumedAt))
        );

      const [loginCode] = await transaction
        .insert(loginCodes)
        .values(params)
        .returning({ id: loginCodes.id });

      return loginCode.id;
    });
  }

  async deleteLoginCode(id: string): Promise<void> {
    await this.database.delete(loginCodes).where(eq(loginCodes.id, id));
  }

  async findActiveLoginCode(
    email: string,
    now: Date
  ): Promise<LoginCode | null> {
    const [loginCode] = await this.database
      .select()
      .from(loginCodes)
      .where(
        and(
          eq(loginCodes.email, email),
          isNull(loginCodes.consumedAt),
          gt(loginCodes.expiresAt, now)
        )
      )
      .orderBy(desc(loginCodes.createdAt))
      .limit(1);

    return loginCode ?? null;
  }

  async incrementLoginCodeAttempts(id: string): Promise<void> {
    await this.database
      .update(loginCodes)
      .set({ attempts: sql`${loginCodes.attempts} + 1` })
      .where(eq(loginCodes.id, id));
  }

  async consumeLoginCodeAndUpsertUser(
    loginCodeId: string,
    email: string,
    now: Date
  ): Promise<User | null> {
    return this.database.transaction(async (transaction) => {
      const [consumedCode] = await transaction
        .update(loginCodes)
        .set({ consumedAt: now })
        .where(
          and(eq(loginCodes.id, loginCodeId), isNull(loginCodes.consumedAt))
        )
        .returning({ id: loginCodes.id });

      if (!consumedCode) {
        return null;
      }

      const [user] = await transaction
        .insert(users)
        .values({ email })
        .onConflictDoUpdate({ target: users.email, set: { updatedAt: now } })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          profileCompletedAt: users.profileCompletedAt,
        });

      return user;
    });
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await this.database
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        profileCompletedAt: users.profileCompletedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async updateUserProfile(
    id: string,
    name: string,
    now: Date
  ): Promise<User | null> {
    const [user] = await this.database
      .update(users)
      .set({ name, profileCompletedAt: now, updatedAt: now })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        profileCompletedAt: users.profileCompletedAt,
      });

    return user ?? null;
  }
}
