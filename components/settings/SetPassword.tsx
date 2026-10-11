
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { setUserPassword } from "@/lib/user-actions/authActions";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import { SetPasswordFormData, setPasswordSchema } from "@/lib/validations/password";

const SetPassword = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SetPasswordFormData>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {newPassword: "", confirmPassword: ""},
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    reset({newPassword: "", confirmPassword: ""});
  };

  const onSubmit = async (data: SetPasswordFormData) => {
    try {
      const result = await setUserPassword(data);

      if(!result.success){
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      reset({newPassword: "", confirmPassword: ""});
      router.refresh();
    } catch(error) {
      console.error("Failed to set password:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="settings-button">
          Set password
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C325D]">
            Set password
          </DialogTitle>

          <DialogDescription>
            Add a password to your CodeTrail account so you can sign in using your email address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-900">
              New password
            </label>

            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              className="settings-input"
              aria-invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? "new-password-error" : "password-requirements"}
            />

            <p id="password-requirements" className="mt-1 text-sm text-gray-500">
              Password must be at least {MIN_PASSWORD_LENGTH} characters.
            </p>

            {errors.newPassword && (
              <p id="new-password-error" className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-900">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              className="settings-input"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />

            {errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="settings-button w-full disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Setting password..." : "Set password"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetPassword;
