
'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import EditQuestion from './EditQuestion';
import { Attempt, Question } from '@/types/types';
import { getQuestionById } from '@/lib/user-actions/questions';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const EditQuestionTrigger = ({ question, onAttemptsUpdated }: { question: Question; onAttemptsUpdated?: (attempts: Attempt[]) => void }) => {
  const [open, setOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const requestIdRef = useRef(0);

  const handleOpenChange = (nextOpen: boolean) => {
    const requestId = ++requestIdRef.current;
    setOpen(nextOpen);
    setEditingQuestion(null);

    if (!nextOpen) return;

    const loadQuestion = async () => {
      try {
        const result = await getQuestionById({ questionId: question.id });

        if (requestId !== requestIdRef.current) return;

        if (!result.success || !result.question) {
          toast.error(result.message || 'Unable to load question.');
          setOpen(false);
          return;
        }

        setEditingQuestion(result.question);
      } catch {
        if (requestId !== requestIdRef.current) return;
        toast.error('Unable to load question.');
        setOpen(false);
      }
    };

    void loadQuestion();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogTrigger asChild>
        <button type="button" className="add-attempt-button">Edit Question</button>
      </DialogTrigger>

      {open && (
        editingQuestion ? (
          <EditQuestion question={editingQuestion} onClose={() => handleOpenChange(false)} onAttemptsUpdated={onAttemptsUpdated} />
        ) : (
          <DialogContent className="sm:max-w-3xl">
            <DialogTitle>Edit Question</DialogTitle>
            <p role="status" className="text-sm text-gray-600">Loading question...</p>
          </DialogContent>
        )
      )}
    </Dialog>
  );
};

export default EditQuestionTrigger;
