import { z } from "zod";

export const budgetItemCreateSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1),
  budgetAmount: z.number().nonnegative(),
  actualAmount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type BudgetItemCreateInput = z.infer<typeof budgetItemCreateSchema>;
