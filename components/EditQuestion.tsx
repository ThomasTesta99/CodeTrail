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

export type EditFormData = z.infer<typeof schema>;

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
    const router = useRouter();
    const {fields} = useFieldArray({
        control, 
        name: "attempts",
    })

    const onSubmit =  async (data: EditFormData) => {
        console.log(data);
        const newQuestion = data;
        const oldQuestion = question
        const result = await updateQuestion({oldQuestion, newQuestion});
        if(result.success){
          toast.success(result.message);
        }else{
          toast.error(result.message);
        }
        onClose();
        router.push(`/question/${question.id}`);
    }

  return (
    <div className="modal-backdrop">
      <div className="modal-content max-w-3xl overflow-y-auto">
        <button className="modal-close" onClick={onClose}>
          <Image src="/assets/icons/close.svg" alt="close" width={16} height={16} />
        </button>

        <h2 className="modal-title">Edit Question</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <input
            {...register("title")}
            placeholder="Title"
            className="input-field"
          />

          <textarea
            {...register("description")}
            placeholder="Description"
            className="input-field"
          />

          <select {...register("difficulty")} className="select-field">
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <div className="space-y-2">
            <input
              type="url"
              placeholder="LeetCode Link (Optional)"
              {...register("link")}
              className="input-field"
            />
          </div>

          <h3 className="text-lg font-semibold mt-4 text-[#2C325D]">Attempts</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-300 p-4 rounded-lg space-y-3 bg-gray-50"
            >
              <textarea
                {...register(`attempts.${index}.solutionCode`)}
                className="input-field"
                placeholder="Solution Code"
              />
              <select
                {...register(`attempts.${index}.language`)}
                className="select-field"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                {...register(`attempts.${index}.durationMinutes`)}
                className="input-field"
                placeholder="Duration (min)"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register(`attempts.${index}.neededHelp`)}
                />
                Needed Help
              </label>
              <textarea
                {...register(`attempts.${index}.notes`)}
                className="input-field"
                placeholder="Notes"
              />
              <input
                type="hidden"
                {...register(`attempts.${index}.id`)}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>

  )
}

export default EditQuestion
