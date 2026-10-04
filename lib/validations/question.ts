import { MAX_CODE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_LABEL_LENGTH, MAX_LANGUAGE_LENGTH, MAX_LINK_LENGTH, MAX_NOTES_LENGTH, MAX_TITLE_LENGTH } from "@/constants";
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
    .min(1, "Solution code is required")
    .max(
      MAX_CODE_LENGTH, 
      `Solution code must be ${MAX_CODE_LENGTH} characters or fewer.`
    ),

  language: z
    .string()
    .min(1, "Language is required")
    .max(
      MAX_LANGUAGE_LENGTH,
      `Language must be ${MAX_LANGUAGE_LENGTH} characters or fewer`
    ),

  neededHelp: z.boolean(),

  durationMinutes: durationMinutesSchema,

  notes: z.string().max(
      MAX_NOTES_LENGTH,
      `Notes must be ${MAX_NOTES_LENGTH} characters or fewer`
    ).optional(),
});

export const editableAttemptSchema = attemptSchema.extend({
  id: z.string().uuid(),
});

export const questionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required").max(
      MAX_TITLE_LENGTH,
      `Title must be ${MAX_TITLE_LENGTH} characters or fewer`
    ),

  description: z
    .string()
    .min(1, "Description is required")
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`
    ),

  difficulty: difficultySchema,

  label: z.string().max(
      MAX_LABEL_LENGTH,
      `Label must be ${MAX_LABEL_LENGTH} characters or fewer`
    ).optional(),

  link: z
    .string()
    .max(
      MAX_LINK_LENGTH,
      `Link must be ${MAX_LINK_LENGTH} characters or fewer`
    )
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