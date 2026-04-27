import { z } from "zod";

export const catchVisibility = z.enum(["private", "friends", "public"]);

export const catchFormSchema = z.object({
  species: z.string().trim().min(1, "Select a species").max(80),
  species_nickname: z
    .string()
    .trim()
    .max(80, "Too long")
    .optional()
    .or(z.literal("")),
  weight_lbs: z
    .number({ invalid_type_error: "Enter a number" })
    .min(0)
    .max(5000)
    .optional()
    .nullable(),
  caught_at: z.string().min(1, "Required"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  bait: z.string().trim().max(120).optional().or(z.literal("")),
  visibility: catchVisibility.default("private"),
});

export type CatchFormInput = z.infer<typeof catchFormSchema>;

export const catchEditSchema = catchFormSchema.partial().extend({
  id: z.string().uuid(),
});
export type CatchEditInput = z.infer<typeof catchEditSchema>;
