import { z } from "zod";

export const guestInvitationSchema = z.object({
  wedding_id: z.string().min(1, "Wedding ID is required"),
  name: z.string().min(2, "Guest name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").nullable().optional().or(z.literal("")),
  phone: z.string().max(30).nullable().optional(),
  group_name: z.string().max(100).nullable().optional(),
  status: z.enum(["invited", "confirmed", "declined", "pending"]).default("invited"),
});

export type GuestInvitationPayload = z.infer<typeof guestInvitationSchema>;
