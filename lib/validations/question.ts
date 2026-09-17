import { z } from "zod";

export const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  label: z.string(),
  link: z.string()
    .optional()
    .refine(
      (val) => !val || z.string().url().safeParse(val).success,
      {
        message: "Must be a valid URL",
      }
    ),
})


export const attemptSchema = z.object({
  solutionCode: z.string().min(1, "Solution code is required"),
  language: z.string().min(1, "Language is required"),
  neededHelp: z.boolean(),
  durationMinutes: z.number().min(1, "Duration is required"),
  notes: z.string().optional(),
});