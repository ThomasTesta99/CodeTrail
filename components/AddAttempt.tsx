'use client'
import { LANGUAGE_OPTIONS } from '@/constants';
import { addAttempt } from '@/lib/user-actions/questions';
import { attemptSchema } from '@/lib/validations/question';
import { Attempt } from '@/types/types';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod'

type AttemptFormData = z.infer<typeof attemptSchema>;

const AddAttempt = (
  { questionId, 
    onClose, 
    onAdd,
  }: { 
    questionId: string, 
    onClose: () => void,
    onAdd: (attempt: Attempt) => void
  }) => {
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<AttemptFormData>({
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
    <div className='modal-backdrop'>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <Image 
            src='/assets/icons/close.svg'
            alt='close'
            width={16}
            height={16}
          /> 
        </button>
        <h2 className="modal-title">Add Attempt</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <textarea placeholder="Solution Code" {...register('solutionCode')} className="input-field" />
          {errors.solutionCode && <p className="error-text">{errors.solutionCode.message}</p>}

          <select {...register('language')} className="input-field" defaultValue="">
            <option value="" disabled hidden>
              Select a language
            </option>
            {LANGUAGE_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.language && <p className="error-text">{errors.language.message}</p>}

          <input type="number" placeholder="Duration (minutes)" {...register('durationMinutes', { valueAsNumber: true })} className="input-field" />
          {errors.durationMinutes && <p className="error-text">{errors.durationMinutes.message}</p>}

          <label className="checkbox-label">
            <input type="checkbox" {...register('neededHelp')} /> Needed Help
          </label>

          <textarea placeholder="Notes (optional)" {...register('notes')} className="input-field" />

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Attempt'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddAttempt
