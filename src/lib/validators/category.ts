import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
