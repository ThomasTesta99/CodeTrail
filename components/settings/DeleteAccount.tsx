"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteUserAccount } from "@/lib/user-actions/authActions";
import { DeleteAccountFormData, deleteAccountSchema } from "@/lib/validations/settings";

const DeleteAccount = ({hasPassword}: {hasPassword: boolean}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {password: "", confirmation: ""},
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if(isSubmitting) return;
    setOpen(nextOpen);
    if(!nextOpen) reset();
  };

  const onSubmit = async (data: DeleteAccountFormData) => {
    if(hasPassword && !data.password.trim()){
      setError("password", {type: "manual", message: "Current password is required."});
      return;
    }

    try {
        if(!confirm("Are you sure you want to delete your account?")){
            return;
        }
        const result = await deleteUserAccount(data);

        if(!result.success){
            toast.error(result.message);
            return;
        }

        toast.success(result.message);
        setOpen(false);
        reset();
        router.replace("/sign-in");
        router.refresh();
    } catch(error) {
      console.error("Failed to delete account:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="settings-button settings-button-danger">
          Delete account
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">
            Delete account
          </DialogTitle>

          <DialogDescription>
            This action is permanent and cannot be undone. Your CodeTrail account, saved questions, coding attempts, and progress will be deleted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {hasPassword && (
            <div>
              <label htmlFor="deletePassword" className="mb-1 block text-sm font-medium text-gray-900">
                Current password
              </label>

              <input
                id="deletePassword"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="settings-input"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "delete-password-error" : undefined}
              />

              {errors.password && (
                <p id="delete-password-error" className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {!hasPassword && (
            <p className="text-sm text-gray-600">
              For security, you must have signed in within the last five minutes to delete your account.
            </p>
          )}

          <div>
            <label htmlFor="deleteConfirmation" className="mb-1 block text-sm font-medium text-gray-900">
              Type DELETE to confirm
            </label>

            <input
              id="deleteConfirmation"
              type="text"
              autoComplete="off"
              placeholder="DELETE"
              {...register("confirmation")}
              className="settings-input"
              aria-invalid={!!errors.confirmation}
              aria-describedby={errors.confirmation ? "delete-confirmation-error" : undefined}
            />

            {errors.confirmation && (
              <p id="delete-confirmation-error" className="mt-1 text-sm text-red-600">
                {errors.confirmation.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => handleOpenChange(false)} disabled={isSubmitting} className="settings-button flex-1 disabled:opacity-50">
              Cancel
            </button>

            <button type="submit" disabled={isSubmitting} className="settings-button settings-button-danger flex-1 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccount;
