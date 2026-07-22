import { z } from "zod";

export const weddingCreateSchema = z.object({
  name: z.string().min(1),
  weddingDate: z.string().optional().or(z.literal("")),
});

export type WeddingCreateInput = z.infer<typeof weddingCreateSchema>;
