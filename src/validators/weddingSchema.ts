import { z } from "zod";

export const weddingProfileSchema = z.object({
  couple_names: z.string().min(2, "Couple names must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(50).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  access_code: z.string().min(3, "Access code must be at least 3 characters").max(20),
  wedding_date: z.string().nullable().optional(),
  ceremony_time: z.string().nullable().optional(),
  ceremony_venue: z.string().nullable().optional(),
  reception_venue: z.string().nullable().optional(),
  venue_address: z.string().nullable().optional(),
  dress_code: z.string().nullable().optional(),
  hashtag: z.string().nullable().optional(),
  published: z.boolean().optional(),
});

export type WeddingProfilePayload = z.infer<typeof weddingProfileSchema>;
