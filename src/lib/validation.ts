import { z } from "zod";

export const bookingCheckoutSchema = z.object({
  roomCategoryId: z.string().min(1, "Room category is required"),
  ratePlanId: z.string().min(1, "Rate plan is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  numGuests: z.number().int().min(1).max(10).optional().default(1),
  guestName: z.string().trim().min(1, "Guest name is required"),
  guestEmail: z.string().trim().email("Valid email is required"),
  guestPhone: z.string().trim().min(1, "Guest phone is required"),
  specialRequests: z.string().trim().max(500).optional(),
  paymentMethod: z
    .enum(["CREDIT_CARD", "BANK_TRANSFER", "CASH", "MOCK_PAYMENT"])
    .optional()
    .default("MOCK_PAYMENT"),
  couponCode: z.string().optional(),
  services: z.array(z.object({ serviceId: z.string(), quantity: z.number().optional() })).optional(),
  rooms: z.array(z.object({ roomCategoryId: z.string(), ratePlanId: z.string().optional(), numGuests: z.number().optional() })).optional(),
});

export type BookingCheckoutInput = z.infer<typeof bookingCheckoutSchema>;
