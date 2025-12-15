'use client'
import Image from 'next/image';
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LANGUAGE_OPTIONS } from '@/constants';
import { Question } from '@/types/types';
import { updateQuestion } from '@/lib/user-actions/questions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], { required_error: 'Difficulty is required' }),
  link: z.union([z.literal(''), z.string().url('Must be a valid URL')]).optional(),
  label: z.string(),
  attempts: z.array(z.object({
    id: z.string(),
    solutionCode: z.string().min(1, 'Solution code is required'),
    language: z.string().min(1, 'Language is required'),
    neededHelp: z.boolean(),
    durationMinutes: z.coerce.number().int('Must be a whole number').min(1, 'Duration must be at least 1 minute'),
    notes: z.string().optional(),
  }))
});

export type EditFormData = z.infer<typeof schema>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-red-600 mt-1">{message}</p> : null;

const EditQuestion = ({ question, onClose }: { question: Question; onClose: () => void }) => {
  const router = useRouter();

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<EditFormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      title: question.title ?? '',
      description: question.description ?? '',
      difficulty: (question.difficulty as 'Easy' | 'Medium' | 'Hard') ?? 'Easy',
      link: question.link ?? '',
      label: question.label ?? 'Unlabeled',
      attempts: (question.attempts ?? []).map(a => ({
        id: a.id,
        solutionCode: a.solutionCode ?? '',
        language: a.language ?? (LANGUAGE_OPTIONS[0]?.value ?? ''),
        neededHelp: Boolean(a.neededHelp),
        durationMinutes: Number(a.durationMinutes ?? 1),
        notes: a.notes ?? ''
      }))
    }
  });

  const { fields } = useFieldArray({
    control,
    name: 'attempts'
  });

  const onSubmit = async (data: EditFormData) => {
    const newQuestion = data;
    const oldQuestion = question;
    if(newQuestion.label === "") newQuestion.label = "Unlabeled"
    const result = await updateQuestion({ oldQuestion, newQuestion });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    onClose();
    router.push(`/question/${question.id}`);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-3xl overflow-y-auto">
        <button className="modal-close" onClick={onClose}>
          <Image src="/assets/icons/close.svg" alt="close" width={16} height={16} />
        </button>

        <h2 className="modal-title">Edit Question</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <input
            {...register('title')}
            placeholder="Title"
            className="input-field"
            aria-invalid={!!errors.title}
          />
          <FieldError message={errors.title?.message} />

          <textarea
            {...register('description')}
            placeholder="Description"
            className="input-field"
            aria-invalid={!!errors.description}
          />
          <FieldError message={errors.description?.message} />

          <select {...register('difficulty')} className="select-field" aria-invalid={!!errors.difficulty}>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <FieldError message={errors.difficulty?.message} />

          <div className="space-y-2">
            <input
              type="url"
              placeholder="LeetCode Link (Optional)"
              {...register('link')}
              className="input-field"
              aria-invalid={!!errors.link}
            />
            <FieldError message={typeof errors.link?.message === 'string' ? errors.link?.message : undefined} />
          </div>

          <input 
            {...register('label')}
            placeholder='Unlabled'
            className='input-field'
            aria-invalid={!!errors.label}
          />

          <h3 className="text-lg font-semibold mt-4 text-[#2C325D]">Attempts</h3>

          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-300 p-4 rounded-lg space-y-3 bg-gray-50">
              <textarea
                {...register(`attempts.${index}.solutionCode`)}
                className="input-field"
                placeholder="Solution Code"
                aria-invalid={!!errors.attempts?.[index]?.solutionCode}
              />
              <FieldError message={errors.attempts?.[index]?.solutionCode?.message} />

              <select
                {...register(`attempts.${index}.language`)}
                className="select-field"
                aria-invalid={!!errors.attempts?.[index]?.language}
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.attempts?.[index]?.language?.message} />

              <input
                type="number"
                min={1}
                step={1}
                {...register(`attempts.${index}.durationMinutes`, { valueAsNumber: true })}
                className="input-field"
                placeholder="Duration (min)"
                aria-invalid={!!errors.attempts?.[index]?.durationMinutes}
              />
              <FieldError message={errors.attempts?.[index]?.durationMinutes?.message} />

              <label className="checkbox-label">
                <input type="checkbox" {...register(`attempts.${index}.neededHelp`)} />
                Needed Help
              </label>

              <textarea
                {...register(`attempts.${index}.notes`)}
                className="input-field"
                placeholder="Notes"
                aria-invalid={!!errors.attempts?.[index]?.notes}
              />
              <FieldError message={errors.attempts?.[index]?.notes?.message} />

              <input type="hidden" {...register(`attempts.${index}.id`)} />
            </div>
          ))}

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
