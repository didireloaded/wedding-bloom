import { z } from "zod";

export const rsvpSubmissionSchema = z.object({
  wedding_id: z.string().min(1, "Wedding ID is required"),
  guest_name: z.string().min(2, "Guest name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").nullable().optional().or(z.literal("")),
  phone: z.string().max(30).nullable().optional(),
  attending: z.enum(["confirmed", "declined", "pending", "maybe", "yes", "no"]),
  guest_count: z.number().int().min(1, "Guest count must be at least 1").max(20, "Maximum 20 guests per party").default(1),
  dietary_preference: z.string().max(200).nullable().optional(),
  dietary_requirements: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  song_request: z.string().max(200).nullable().optional(),
  message: z.string().max(1000).nullable().optional(),
});

export type RSVPSubmissionPayload = z.infer<typeof rsvpSubmissionSchema>;
