import { z } from "zod";

export const changeNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or less."),
});

export const changeEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type ChangeNameFormData = z.infer<typeof changeNameSchema>;