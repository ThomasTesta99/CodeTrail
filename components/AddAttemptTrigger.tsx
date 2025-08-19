'use client'
import React, { useState } from 'react'
import AddAttempt from './AddAttempt';
import { Attempt } from '@/types/types';

const AddAttemptTrigger = ({
  questionId,
  onAdd,
}: {
  questionId: string,
  onAdd: (attempt: Attempt) => void
}) => {
    const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button className="add-attempt-button" onClick={() => setShowModal(true)}>
          Add New Attempt
      </button>
      {showModal && (
        <AddAttempt questionId={questionId} onClose={() => setShowModal(false)}  onAdd={onAdd}/>
      )}
    </>
  )
}

export default AddAttemptTrigger
