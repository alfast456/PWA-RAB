import { z } from "zod";

export const paymentCreateSchema = z.object({
  vendorId: z.string(),
  type: z.enum(["DP", "CICILAN", "PELUNASAN"]),
  amount: z.number().nonnegative(),
  dueDate: z.string().datetime().optional(),
});

export const paymentUpdateSchema = z.object({
  status: z.enum(["BELUM_BAYAR", "SUDAH_BAYAR"]).optional(),
  paidAt: z.string().datetime().optional(),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;
