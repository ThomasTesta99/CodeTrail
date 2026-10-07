"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { changeNameSchema, ChangeNameFormData } from "@/lib/validations/settings";
import { updateUserName } from "@/lib/user-actions/authActions";

const ChangeName = ({ currentName }: { currentName: string }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangeNameFormData>({
    resolver: zodResolver(changeNameSchema),
    defaultValues: { name: currentName },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      reset({ name: currentName });
    }
  };

  const onSubmit = async (data: ChangeNameFormData) => {
    try {
      const result = await updateUserName({ name: data.name });

      if (!result.success) {
        toast.error(result.message || "Failed to update name.");
        return;
      }

      toast.success(result.message);
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="settings-button">
          Change name
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C325D]">
            Change name
          </DialogTitle>

          <DialogDescription>
            Update the name associated with your CodeTrail account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-900">
              Name
            </label>

            <input
              id="name"
              type="text"
              {...register("name")}
              className="settings-input"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />

            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="settings-button w-full disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save name"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeName;