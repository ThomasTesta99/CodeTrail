'use client'

import { useState } from 'react';
import AddAttempt from './AddAttempt';
import { Attempt } from '@/types/types';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';

const AddAttemptTrigger = ({
  questionId,
  onAdd,
}: {
  questionId: string;
  onAdd: (attempt: Attempt) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <button className="add-attempt-button">
          Add New Attempt
        </button>
      </DialogTrigger>

      <AddAttempt
        questionId={questionId}
        onAdd={onAdd}
        onClose={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddAttemptTrigger;