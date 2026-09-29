import { z } from "zod";

export const difficultySchema = z.enum([
  "Easy",
  "Medium",
  "Hard",
]);

export const durationMinutesSchema = z
  .number()
  .int("Must be a whole number")
  .min(1, "Duration must be at least 1 minute");

export const attemptSchema = z.object({
  solutionCode: z
    .string()
    .min(1, "Solution code is required"),

  language: z
    .string()
    .min(1, "Language is required"),

  neededHelp: z.boolean(),

  durationMinutes: durationMinutesSchema,

  notes: z.string().optional(),
});

export const editableAttemptSchema = attemptSchema.extend({
  id: z.string().uuid(),
});

export const questionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required"),

  description: z
    .string()
    .min(1, "Description is required"),

  difficulty: difficultySchema,

  label: z.string().optional(),

  link: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        z.string().url().safeParse(val).success,
      {
        message: "Must be a valid URL",
      }
    ),
});


export type Difficulty = z.infer<typeof difficultySchema>;

export const editQuestionSchema =
  questionSchema.extend({
    attempts: z.array(editableAttemptSchema),
  });

export type AttemptFormData = z.infer<
  typeof attemptSchema
>;

export type QuestionFormData = z.infer<
  typeof questionSchema
>;

export type EditFormData = z.infer<
  typeof editQuestionSchema
>;