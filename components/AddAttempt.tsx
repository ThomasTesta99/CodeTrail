'use client '
import { addAttempt } from '@/lib/user-actions/questions';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod'

const attemptSchema = z.object({
  solutionCode: z.string().min(1, "Solution code is required"),
  language: z.string().min(1, 'Language is required'),
  neededHelp: z.boolean(),
  durationMinutes: z.number().min(1, 'Duration is required'),
  notes: z.string().optional(),
})

type AttemptFormData = z.infer<typeof attemptSchema>;

const AddAttempt = ({ questionId, onClose }: { questionId: string, onClose: () => void }) => {
  const router = useRouter();
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<AttemptFormData>({
    resolver: zodResolver(attemptSchema),
  });

  const onSubmit = async (data: AttemptFormData) => {
    const newAttempt = {
      id: crypto.randomUUID(),
      questionId, 
      createdAt: new Date(),
      ...data,
    };

    const result = await addAttempt({questionId: questionId, attempt: newAttempt});

    if(result.success){
      toast.success(result.message);
      onClose();
      router.refresh();
    }else{
      toast.error(result.message || 'Failed to add attempt');
    }
  }
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

          <input placeholder="Language (e.g., TypeScript)" {...register('language')} className="input-field" />
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
