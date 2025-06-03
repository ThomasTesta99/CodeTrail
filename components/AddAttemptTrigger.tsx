'use client'
import React, { useState } from 'react'
import AddAttempt from './AddAttempt';

const AddAttemptTrigger = ({questionId}: {questionId: string}) => {
    const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button className="add-attempt-button" onClick={() => setShowModal(true)}>
          Add New Attempt
      </button>
      {showModal && (
        <AddAttempt questionId={questionId} onClose={() => setShowModal(false)}/>
      )}
    </>
  )
}

export default AddAttemptTrigger
