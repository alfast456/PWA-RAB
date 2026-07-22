import { z } from "zod";

export const memberInviteSchema = z.object({
  email: z.string().email(),
});

export type MemberInviteInput = z.infer<typeof memberInviteSchema>;
