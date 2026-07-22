import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(["BELUM", "SEDANG_BERJALAN", "SELESAI"]).optional(),
  assignedToId: z.string().optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
