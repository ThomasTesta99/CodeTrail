'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteQuestion } from '@/lib/user-actions/questions';

export const DeleteQuestionButton = ({ questionId }: { questionId: string }) => {
  const router = useRouter();

  const handleDeleteQuestion = async () => {
    const result = await deleteQuestion({ questionId });
    if (result.success) {
      toast.success(result.message);
      setTimeout(() => router.push('/'), 1500);  // Optional delay
    } else {
      toast.error(result.message);
    }
  };

  return (
    <button className="delete-question-button" onClick={handleDeleteQuestion}>
      Delete Question
    </button>
  );
};
