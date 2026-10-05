'use client';

import { useRef } from 'react';
import {
  Attempt,
  Question,
  QuestionDetailsHandle,
} from '@/types/types';
import QuestionDetails from './QuestionDetails';
import EditQuestionTrigger from './EditQuestionTrigger';
import { DeleteButton } from './DeleteButton';

const QuestionPageContent = ({
  question,
  questionId,
}: {
  question: Question;
  questionId: string;
}) => {
  const questionDetailsRef =
    useRef<QuestionDetailsHandle>(null);

  const handleAttemptsUpdated = (
    updatedAttempts: Attempt[]
  ) => {
    questionDetailsRef.current?.updateAttempts(
      updatedAttempts
    );
  };

  return (
    <>
      <QuestionDetails
        ref={questionDetailsRef}
        question={question}
      />

      <section className="button-section">
        <EditQuestionTrigger
          question={question}
          onAttemptsUpdated={handleAttemptsUpdated}
        />

        <DeleteButton
          deleteItemId={questionId}
          buttonLabel="Delete Question"
          deleteType="delete-question"
          className="delete-question-button"
        />
      </section>
    </>
  );
};

export default QuestionPageContent;