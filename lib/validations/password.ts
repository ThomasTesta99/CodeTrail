import { MIN_PASSWORD_LENGTH } from "@/constants";
import { z } from "zod";

export const passwordSchema = z
    .string()
    .min(
        MIN_PASSWORD_LENGTH, 
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    )

export const setPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "Your new password must be different from your current password.",
  path: ["newPassword"],
});



export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;