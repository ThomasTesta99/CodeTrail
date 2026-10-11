
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { changeUserPassword } from "@/lib/user-actions/authActions";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { ChangePasswordFormData, changePasswordSchema } from "@/lib/validations/password";

const ChangePassword = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {currentPassword: "", newPassword: "", confirmPassword: ""},
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if(!nextOpen) reset();
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      const result = await changeUserPassword(data);

      if(!result.success){
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      reset();
      router.refresh();
    } catch(error) {
      console.error("Failed to change password:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="settings-button">
          Change password
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C325D]">
            Change password
          </DialogTitle>

          <DialogDescription>
            Enter your current password and choose a new one. Other active sessions will be signed out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-gray-900">
              Current password
            </label>

            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
              className="settings-input"
              aria-invalid={!!errors.currentPassword}
              aria-describedby={errors.currentPassword ? "current-password-error" : undefined}
            />

            {errors.currentPassword && (
              <p id="current-password-error" className="mt-1 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="changeNewPassword" className="mb-1 block text-sm font-medium text-gray-900">
              New password
            </label>

            <input
              id="changeNewPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              className="settings-input"
              aria-invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? "change-new-password-error" : "change-password-requirements"}
            />

            <p id="change-password-requirements" className="mt-1 text-sm text-gray-500">
              Password must be at least {MIN_PASSWORD_LENGTH} characters.
            </p>

            {errors.newPassword && (
              <p id="change-new-password-error" className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="changeConfirmPassword" className="mb-1 block text-sm font-medium text-gray-900">
              Confirm new password
            </label>

            <input
              id="changeConfirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="settings-input"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "change-confirm-password-error" : undefined}
            />

            {errors.confirmPassword && (
              <p id="change-confirm-password-error" className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="settings-button w-full disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Changing password..." : "Change password"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
