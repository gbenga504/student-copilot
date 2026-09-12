import { z } from "zod";

export const getCurrentUserResponseDto = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().nullable(),
  requiresName: z.boolean(),
});

export const updateUserProfileRequestDto = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});
