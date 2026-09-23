'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {  deleteAttempt, deleteQuestion } from '@/lib/user-actions/questions';
import { DeleteType } from '@/types/types';
import { useRef, useState } from 'react';

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
  onDeleteSuccess?: (deletedItemId: string) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const isDeletingRef = useRef(false);
  const router = useRouter();

  const handleDelete = async () => {
    if(isDeletingRef.current) return;
    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      const result = 
        deleteType === "delete-question"
          ? await deleteQuestion({deleteItemId})
          : await deleteAttempt({deleteItemId});

      if(!result.success){
        toast.error(result.message || "Failed to delete item.");
        return;
      }

      toast.success(result.message);

      if(deleteType === "delete-question"){
        router.push("/");
      }else{
        onDeleteSuccess?.(deleteItemId)
      }
    } catch (error) {
      console.error("Delete failed: ", error);
      toast.error("Unable to delete item. Please try again");
    }finally{
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <button 
      className={className} 
      onClick={(handleDelete)} 
      disabled={isDeleting}
    >
      {buttonLabel}
    </button>
  );
};
