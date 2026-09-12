import { z } from "zod";

export const verifyCodeRequestDto = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  code: z.string().regex(/^\d{6}$/, "Code must contain six digits"),
});

export const verifyCodeResponseDto = z.object({
  accessToken: z.string(),
  requiresName: z.boolean(),
});
