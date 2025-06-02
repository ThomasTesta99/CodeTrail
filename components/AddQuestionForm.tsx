'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { addQuestion } from '@/lib/user-actions/questions'
import toast from 'react-hot-toast'

const questionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  link: z.string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: 'Must be a valid URL',
    }),
})

type QuestionFormData = z.infer<typeof questionSchema>

const AddQuestionForm = ({ user }: UserProps) => {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  })

  const onSubmit = async (data: QuestionFormData) => {
    if (!user?.id) {
      throw new Error('No User id');
    }
    const newQuestion = {
      id: crypto.randomUUID(),
      ...data,
      userId: user.id,
      createdAt: new Date(),
      attempts: [],
    }

    console.log('Submitting Question:', newQuestion);
    const result = await addQuestion({ q: newQuestion })

    if (result.success) {
      toast.success(result.message);
      router.push('/');
    } else {
      toast.error(result.message)
      throw new Error(result.error)
    }
  }

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit(onSubmit)} className="form-container">
        <h1 className="text-4xl font-extrabold text-center">Add New Question</h1>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Question Title"
            {...register('title')}
            className="input-field"
          />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <textarea
            placeholder="Question Description"
            {...register('description')}
            className="input-field"
            rows={4}
          />
          {errors.description && <p className="error-text">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <select {...register('difficulty')} className="select-field">
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          {errors.difficulty && <p className="error-text">{errors.difficulty.message}</p>}
        </div>

        <div className="space-y-2">
          <input
            type="url"
            placeholder="LeetCode Link (Optional)"
            {...register('link')}
            className="input-field"
          />
          {errors.link && <p className="error-text">{errors.link.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Adding...' : 'Add Question'}
        </button>
      </form>
    </div>
  )
}

export default AddQuestionForm
