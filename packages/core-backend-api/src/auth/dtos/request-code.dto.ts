import { z } from "zod";

export const requestCodeRequestDto = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export const requestCodeResponseDto = z.object({
  sent: z.boolean(),
});
