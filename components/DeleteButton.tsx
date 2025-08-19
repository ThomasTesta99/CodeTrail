'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {  deleteAttempt, deleteQuestion } from '@/lib/user-actions/questions';
import { DeleteType } from '@/types/types';

export const DeleteButton = ({ 
  deleteItemId, 
  buttonLabel, 
  deleteType,
  className = "delete-question-button",
  onDeleteSuccess,
}: { 
  deleteItemId: string,
  buttonLabel : string, 
  deleteType: DeleteType,
  className: string,
  onDeleteSuccess?: () => void
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    let result;
    if(deleteType === 'delete-question'){
      result = await deleteQuestion({ deleteItemId });
    }else if(deleteType === 'delete-attempt'){
      result = await deleteAttempt({deleteItemId});
      console.log(result);
    }

    if(result){
      if (result.success) {
        toast.success(result.message);
        setTimeout(() => {
          if (deleteType === 'delete-question') {
            router.push('/');
          } else {
             onDeleteSuccess?.();
             router.refresh()
          }
        }, 1500);
      } else {
        toast.error(result.message);
      }
    }
  };

  return (
    <button className={className} onClick={handleDelete}>
      {buttonLabel}
    </button>
  );
};
