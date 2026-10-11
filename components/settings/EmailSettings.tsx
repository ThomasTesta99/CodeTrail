"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { changeUserEmail, sendVerificationEmail } from "@/lib/user-actions/authActions";
import { changeEmailSchema, ChangeEmailFormData } from "@/lib/validations/settings";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const EmailSettings = ({ email, emailVerified }: { email: string; emailVerified: boolean }) => {
  const [open, setOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email },
  });

  const handleVerifyEmail = async () => {
    try {
      setIsVerifying(true);

      const result = await sendVerificationEmail();

      if (!result.success) {
        toast.error(result.message || "Failed to send verification email.");
        return;
      }

      toast.success(result.message);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      reset({ email });
    }
  };

  const onSubmit = async (data: ChangeEmailFormData) => {
    try {
      const result = await changeUserEmail({ email: data.email });

      if (!result.success) {
        toast.error(result.message || "Failed to change email.");
        return;
      }

      toast.success(result.message);
      setOpen(false);
    } catch (error) {
      console.error("Failed to change email:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (!emailVerified) {
    return (
      <button type="button" onClick={handleVerifyEmail} disabled={isVerifying} className="settings-button disabled:cursor-not-allowed disabled:opacity-50">
        {isVerifying ? "Sending..." : "Verify email"}
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="settings-button">
          Change email
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C325D]">
            Change email
          </DialogTitle>

            <DialogDescription>
                We&apos;ll first send an approval link to your current email. After you approve the change, we&apos;ll send a verification link to your new email address.
            </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-900">
              New email address
            </label>

            <input id="email" type="email" {...register("email")} className="settings-input" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />

            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="settings-button w-full disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Sending..." : "Request email change"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSettings;