import type { AxiosInstance } from "axios";

import { throwApiError } from "~/errors/api-error";

export type User = {
  id: string;
  email: string;
  name: string | null;
  requiresName: boolean;
};

export type VerifyLoginCodeResponse = {
  accessToken: string;
  requiresName: boolean;
};

export class AuthResource {
  constructor(private readonly httpClient: AxiosInstance) {}

  async requestLoginCode(email: string): Promise<{ sent: boolean }> {
    try {
      const response = await this.httpClient.post<{ sent: boolean }>(
        "/auth/request-code",
        { email }
      );

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async verifyLoginCode(
    email: string,
    code: string
  ): Promise<VerifyLoginCodeResponse> {
    try {
      const response = await this.httpClient.post<VerifyLoginCodeResponse>(
        "/auth/verify-code",
        { email, code }
      );

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.httpClient.get<User>("/auth/me");

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }

  async updateCurrentUser(name: string): Promise<User> {
    try {
      const response = await this.httpClient.patch<User>("/auth/me", { name });

      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  }
}
