export type CreateAccessTokenParams = {
  subject: string;
  claims: Record<string, unknown>;
};

export interface AccessTokenProvider {
  create(params: CreateAccessTokenParams): string;
  verify(token: string): Record<string, unknown>;
}
