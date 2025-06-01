'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { addQuestion } from '@/lib/user-actions/questions'

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

const AddQuestionForm = ({user}: UserProps) => {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
  })

  const onSubmit = async (data: QuestionFormData) => {
    if(!user?.id){
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
    const result = await addQuestion({q: newQuestion})
    
    if(result.success){
      router.push('/');
    }else{
      throw new Error(result.error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-6 bg-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl bg-[#1E1E2F] text-white rounded-3xl shadow-xl p-10 space-y-6 backdrop-blur-md"
      >
        <h1 className="text-4xl font-extrabold text-center">Add New Question</h1>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Question Title"
            {...register('title')}
            className="w-full p-3 rounded-lg border border-white bg-transparent text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white transition"
          />
          {errors.title && <p className="text-red-400 text-sm">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <textarea
            placeholder="Question Description"
            {...register('description')}
            className="w-full p-3 rounded-lg border border-white bg-transparent text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white transition"
            rows={4}
          />
          {errors.description && <p className="text-red-400 text-sm">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <select
            {...register('difficulty')}
            className="w-full p-3 rounded-lg border border-white bg-[#1E1E2F] text-white focus:outline-none focus:ring-2 focus:ring-white transition"
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          {errors.difficulty && <p className="text-red-400 text-sm">{errors.difficulty.message}</p>}
        </div>

        <div className="space-y-2">
          <input
            type="url"
            placeholder="LeetCode Link (Optional)"
            {...register('link')}
            className="w-full p-3 rounded-lg border border-white bg-transparent text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white transition"
          />
          {errors.link && <p className="text-red-400 text-sm">{errors.link.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-white text-[#1E1E2F] rounded-lg font-bold text-lg hover:bg-gray-200 transition"
        >
          {isSubmitting ? 'Adding...' : 'Add Question'}
        </button>
      </form>
    </div>
  )
}

export default AddQuestionForm
