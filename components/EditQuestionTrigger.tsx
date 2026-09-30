'use client'

import { useState } from 'react';
import EditQuestion from './EditQuestion';
import { Question } from '@/types/types';
import {Dialog,DialogTrigger} from '@/components/ui/dialog';

const EditQuestionTrigger = ({ question }: { question: Question }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      modal={true}
    >
      <DialogTrigger asChild>
        <button className="add-attempt-button">
          Edit Question
        </button>
      </DialogTrigger>

      <EditQuestion
        question={question}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default EditQuestionTrigger;