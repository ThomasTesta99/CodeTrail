import Image from 'next/image';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LANGUAGE_OPTIONS } from '@/constants';
import { Question } from '@/types/types';

const schema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    link: z.string().url().optional().or(z.literal('')),
    attempts: z.array(z.object({
        id: z.string(), 
        solutionCode: z.string().min(1),
        language: z.string().min(1),
        neededHelp: z.boolean(),
        durationMinutes: z.number().min(1),
        notes: z.string().optional(),
    }))
})

type EditFormData = z.infer<typeof schema>;

const EditQuestion = ({question, onClose}: {question: Question; onClose : () => void}) => {
    const {register, handleSubmit, control, formState: {errors, isSubmitting}} = useForm<EditFormData>({
        resolver: zodResolver(schema),
        defaultValues:{
            title : question.title,
            description: question.description,
            difficulty: question.difficulty as 'Easy' | 'Medium' | 'Hard',
            attempts: question.attempts,
        }
    })

    const {fields} = useFieldArray({
        control, 
        name: "attempts",
    })

    const onSubmit =  async (data: EditFormData) => {
        console.log(data);
        onClose();
    }

  return (
    <div className='modal-backdrop'>
      <div className='modal-content'>
        <button className="modal-close" onClick={onClose}>
          <Image src='/assets/icons/close.svg' alt='close' width={16} height={16} />
        </button>
        <h2 className='modal-title'>Edit Question</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('title')} placeholder="Title" className="input" />
          <textarea {...register('description')} placeholder="Description" className="textarea" />
          <select {...register('difficulty')} className="select">
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <h3 className="text-lg font-semibold mt-4">Attempts</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-3 rounded-md space-y-2">
              <textarea {...register(`attempts.${index}.solutionCode`)} className="textarea" />
              <select {...register(`attempts.${index}.language`)} className="select">
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input type="number" {...register(`attempts.${index}.durationMinutes`)} className="input" placeholder="Duration (min)" />
              <label>
                <input type="checkbox" {...register(`attempts.${index}.neededHelp`)} />
                Needed Help
              </label>
              <textarea {...register(`attempts.${index}.notes`)} className="textarea" placeholder="Notes" />
              <input type="hidden" {...register(`attempts.${index}.id`)} />
            </div>
          ))}

          <button type="submit" disabled={isSubmitting} className="btn">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditQuestion
