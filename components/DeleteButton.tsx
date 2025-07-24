'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteQuestion } from '@/lib/user-actions/questions';
import { DeleteType } from '@/types/types';

export const DeleteButton = ({ 
  questionId, 
  buttonLabel, 
  deleteType 
}: { 
  questionId: string,
  buttonLabel : string, 
  deleteType: DeleteType}) => {
  const router = useRouter();

  const handleDelete = async () => {
    if(deleteType === 'delete-question'){
      const result = await deleteQuestion({ questionId });
    if (result.success) {
      toast.success(result.message);
      setTimeout(() => router.push('/'), 1500);
    } else {
      toast.error(result.message);
    }
    }
  };

  return (
    <button className="delete-button" onClick={handleDelete}>
      {buttonLabel}
    </button>
  );
};
