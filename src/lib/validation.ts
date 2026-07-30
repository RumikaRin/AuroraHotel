// Zod schemas for every API route input. Routes must parse their input with
// these schemas before touching the database (FLOF rule: no unvalidated
// request bodies reach a service function).

import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Cart is empty")
    .max(50),
  couponCode: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["COD", "TRANSFER"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const productListQuerySchema = z.object({
  // Cap page size so a single request cannot dump the whole catalog.
  take: z.coerce.number().int().min(1).max(50).default(20),
});
