import { z } from "zod";

export const vendorCreateSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().optional(),
  contact: z.string().optional(),
  totalContract: z.number().nonnegative().optional(),
});

export type VendorCreateInput = z.infer<typeof vendorCreateSchema>;
