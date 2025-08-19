'use client'
import React, { useState } from 'react'
import EditQuestion from './EditQuestion'
import { Question } from '@/types/types'

const EditQuestionTrigger = ({question} : {question: Question}) => {
    const [showModal, setShowModal] = useState(false)
  return (
    <>
        <button className = "add-attempt-button" onClick={() => setShowModal(true)}>
            Edit Question
        </button>
        {showModal && (
            <EditQuestion question = {question} onClose={() => setShowModal(false)}/>
        )}
    </>
  )
}

export default EditQuestionTrigger
