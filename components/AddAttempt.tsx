'use client'

import { LANGUAGE_OPTIONS } from '@/constants';
import { addAttempt } from '@/lib/user-actions/questions';
import { attemptSchema, AttemptFormData } from '@/lib/validations/question';
import { Attempt } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const AddAttempt = ({
  questionId,
  onClose,
  onAdd,
}: {
  questionId: string;
  onClose: () => void;
  onAdd: (attempt: Attempt) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AttemptFormData>({
    resolver: zodResolver(attemptSchema),
  });

  const onSubmit = async (data: AttemptFormData) => {
    const result = await addAttempt({
      questionId,
      attempt: data,
    });

    if (result.success && result.attempt) {
      toast.success(result.message);
      onAdd(result.attempt);
      onClose();
    } else {
      toast.error(result.message || 'Failed to add attempt');
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogTitle className="modal-title text-3xl">
        Add Attempt
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
        <div>
          <label htmlFor="solutionCode" className="block text-sm font-medium mb-1">
            Solution Code
          </label>

          <textarea
            id="solutionCode"
            {...register('solutionCode')}
            className="input-field"
            placeholder='Solution Code'
            aria-invalid={!!errors.solutionCode}
            aria-describedby={errors.solutionCode ? 'solutionCode-error' : undefined}
          />

          {errors.solutionCode && (
            <p id="solutionCode-error" className="error-text">
              {errors.solutionCode.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1">
            Language
          </label>

          <select
            id="language"
            {...register('language')}
            className="input-field"
            defaultValue=""
            aria-invalid={!!errors.language}
            aria-describedby={errors.language ? 'language-error' : undefined}
          >
            <option value="" disabled hidden>
              Select a language
            </option>

            {LANGUAGE_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {errors.language && (
            <p id="language-error" className="error-text">
              {errors.language.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="durationMinutes" className="block text-sm font-medium mb-1">
            Duration (minutes)
          </label>

          <input
            id="durationMinutes"
            type="number"
            {...register('durationMinutes', { valueAsNumber: true })}
            className="input-field"
            placeholder='Duration (minutes)'
            aria-invalid={!!errors.durationMinutes}
            aria-describedby={errors.durationMinutes ? 'durationMinutes-error' : undefined}
          />

          {errors.durationMinutes && (
            <p id="durationMinutes-error" className="error-text">
              {errors.durationMinutes.message}
            </p>
          )}
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            {...register('neededHelp')}
          />
          Needed Help
        </label>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes (optional)
          </label>

          <textarea
            id="notes"
            {...register('notes')}
            placeholder='Notes'
            className="input-field"
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
          />
          {errors.notes && (
            <p id="notes-error" className="error-text">
              {errors.notes.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Attempt'}
        </button>
      </form>
    </DialogContent>
  );
};

export default AddAttempt;