'use client'

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LANGUAGE_OPTIONS } from '@/constants';
import { Question } from '@/types/types';
import { updateQuestion } from '@/lib/user-actions/questions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { normalizeQuestionLabel } from '@/lib/utils/normalizeLabel';
import { EditFormData, editQuestionSchema } from '@/lib/validations/question';
import { DialogContent, DialogTitle } from './ui/dialog';

const FieldError = ({
  id,
  message,
}: {
  id: string;
  message?: string;
}) =>
  message ? (
    <p id={id} className="text-sm text-red-600 mt-1">
      {message}
    </p>
  ) : null;

const EditQuestion = ({
  question,
  onClose,
}: {
  question: Question;
  onClose: () => void;
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editQuestionSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: question.title ?? '',
      description: question.description ?? '',
      difficulty: question.difficulty,
      link: question.link ?? '',
      label: normalizeQuestionLabel(question.label) ?? '',
      attempts: (question.attempts ?? []).map((a) => ({
        id: a.id,
        solutionCode: a.solutionCode ?? '',
        language: a.language ?? (LANGUAGE_OPTIONS[0]?.value ?? ''),
        neededHelp: Boolean(a.neededHelp),
        durationMinutes: Number(a.durationMinutes ?? 1),
        notes: a.notes ?? '',
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'attempts',
  });

  const onSubmit = async (data: EditFormData) => {
    try {
      const result = await updateQuestion({
        oldQuestion: question,
        newQuestion: data,
      });

      if (!result.success) {
        toast.error(result.message || 'Failed to update question');
        return;
      }

      toast.success(
        result.message || 'Question updated successfully'
      );

      onClose();
      router.refresh();
    } catch (error) {
      console.error('Failed to update question: ', error);
      toast.error(
        'An unexpected error occurred. Please try again.'
      );
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogTitle className="modal-title text-3xl">
        Edit Question
      </DialogTitle>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="modal-form"
      >
        <div>
          <label
            htmlFor="edit-title"
            className="block text-sm font-medium mb-1"
          >
            Title
          </label>

          <input
            id="edit-title"
            {...register('title')}
            placeholder="Title"
            className="input-field"
            aria-invalid={!!errors.title}
            aria-describedby={
              errors.title ? 'edit-title-error' : undefined
            }
          />

          <FieldError
            id="edit-title-error"
            message={errors.title?.message}
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>

          <textarea
            id="edit-description"
            {...register('description')}
            placeholder="Description"
            className="input-field"
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description
                ? 'edit-description-error'
                : undefined
            }
          />

          <FieldError
            id="edit-description-error"
            message={errors.description?.message}
          />
        </div>

        <div>
          <label
            htmlFor="edit-difficulty"
            className="block text-sm font-medium mb-1"
          >
            Difficulty
          </label>

          <select
            id="edit-difficulty"
            {...register('difficulty')}
            className="select-field"
            aria-invalid={!!errors.difficulty}
            aria-describedby={
              errors.difficulty
                ? 'edit-difficulty-error'
                : undefined
            }
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <FieldError
            id="edit-difficulty-error"
            message={errors.difficulty?.message}
          />
        </div>

        <div>
          <label
            htmlFor="edit-link"
            className="block text-sm font-medium mb-1"
          >
            LeetCode Link (optional)
          </label>

          <input
            id="edit-link"
            type="url"
            placeholder="LeetCode Link (Optional)"
            {...register('link')}
            className="input-field"
            aria-invalid={!!errors.link}
            aria-describedby={
              errors.link ? 'edit-link-error' : undefined
            }
          />

          <FieldError
            id="edit-link-error"
            message={
              typeof errors.link?.message === 'string'
                ? errors.link.message
                : undefined
            }
          />
        </div>

        <div>
          <label
            htmlFor="edit-label"
            className="block text-sm font-medium mb-1"
          >
            Label
          </label>

          <input
            id="edit-label"
            {...register('label')}
            placeholder="Unlabeled"
            className="input-field"
            aria-invalid={!!errors.label}
            aria-describedby={
              errors.label ? 'edit-label-error' : undefined
            }
          />

          <FieldError
            id="edit-label-error"
            message={errors.label?.message}
          />
        </div>

        <h3 className="text-lg font-semibold mt-4 text-[#2C325D]">
          Attempts
        </h3>

        {fields.map((field, index) => {
          const solutionCodeErrorId =
            `attempt-${index}-solutionCode-error`;

          const languageErrorId =
            `attempt-${index}-language-error`;

          const durationErrorId =
            `attempt-${index}-duration-error`;

          const notesErrorId =
            `attempt-${index}-notes-error`;

          return (
            <div
              key={field.id}
              className="border border-gray-300 p-4 rounded-lg space-y-3 bg-gray-50"
            >
              <h4 className="font-semibold text-[#2C325D]">
                Attempt {index + 1}
              </h4>

              <div>
                <label
                  htmlFor={`attempt-${index}-solutionCode`}
                  className="block text-sm font-medium mb-1"
                >
                  Solution Code
                </label>

                <textarea
                  id={`attempt-${index}-solutionCode`}
                  {...register(
                    `attempts.${index}.solutionCode`
                  )}
                  className="input-field"
                  placeholder="Solution Code"
                  aria-invalid={
                    !!errors.attempts?.[index]?.solutionCode
                  }
                  aria-describedby={
                    errors.attempts?.[index]?.solutionCode
                      ? solutionCodeErrorId
                      : undefined
                  }
                />

                <FieldError
                  id={solutionCodeErrorId}
                  message={
                    errors.attempts?.[index]?.solutionCode
                      ?.message
                  }
                />
              </div>

              <div>
                <label
                  htmlFor={`attempt-${index}-language`}
                  className="block text-sm font-medium mb-1"
                >
                  Language
                </label>

                <select
                  id={`attempt-${index}-language`}
                  {...register(
                    `attempts.${index}.language`
                  )}
                  className="select-field"
                  aria-invalid={
                    !!errors.attempts?.[index]?.language
                  }
                  aria-describedby={
                    errors.attempts?.[index]?.language
                      ? languageErrorId
                      : undefined
                  }
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>

                <FieldError
                  id={languageErrorId}
                  message={
                    errors.attempts?.[index]?.language
                      ?.message
                  }
                />
              </div>

              <div>
                <label
                  htmlFor={`attempt-${index}-duration`}
                  className="block text-sm font-medium mb-1"
                >
                  Duration (minutes)
                </label>

                <input
                  id={`attempt-${index}-duration`}
                  type="number"
                  min={1}
                  step={1}
                  {...register(
                    `attempts.${index}.durationMinutes`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  className="input-field"
                  placeholder="Duration (min)"
                  aria-invalid={
                    !!errors.attempts?.[index]
                      ?.durationMinutes
                  }
                  aria-describedby={
                    errors.attempts?.[index]
                      ?.durationMinutes
                      ? durationErrorId
                      : undefined
                  }
                />

                <FieldError
                  id={durationErrorId}
                  message={
                    errors.attempts?.[index]
                      ?.durationMinutes?.message
                  }
                />
              </div>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register(
                    `attempts.${index}.neededHelp`
                  )}
                />
                Needed Help
              </label>

              <div>
                <label
                  htmlFor={`attempt-${index}-notes`}
                  className="block text-sm font-medium mb-1"
                >
                  Notes
                </label>

                <textarea
                  id={`attempt-${index}-notes`}
                  {...register(
                    `attempts.${index}.notes`
                  )}
                  className="input-field"
                  placeholder="Notes"
                  aria-invalid={
                    !!errors.attempts?.[index]?.notes
                  }
                  aria-describedby={
                    errors.attempts?.[index]?.notes
                      ? notesErrorId
                      : undefined
                  }
                />

                <FieldError
                  id={notesErrorId}
                  message={
                    errors.attempts?.[index]?.notes
                      ?.message
                  }
                />
              </div>

              <input
                type="hidden"
                {...register(`attempts.${index}.id`)}
              />
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </DialogContent>
  );
};

export default EditQuestion;