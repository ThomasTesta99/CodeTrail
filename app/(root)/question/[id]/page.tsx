import QuestionDetails from '@/components/QuestionDetails';
import { getQuestionById } from '@/lib/user-actions/questions';
import { DeleteButton } from '@/components/DeleteButton';
import React from 'react'
import EditQuestionTrigger from '@/components/EditQuestionTrigger';

const page = async ({ params }: { params: { id: string } }) => {
  const questionId = await params.id;

  const result = await getQuestionById({ questionId });

  if (!result.success || !result.question) {
    return <div className="p-6 text-red-600">Question not found.</div>;
  }

  const question = {
    ...result.question,
    difficulty: result.question.difficulty as 'Easy' | 'Medium' | 'Hard',
    link: result.question.link ?? undefined,
    createdAt: result.question.createdAt ?? new Date(),
    attempts: result.question.attempts?.map(a => ({
      ...a,
      notes: a.notes ?? '',
      createdAt: a.createdAt ?? new Date(),
    })) ?? [],
  };

  return (
    <div className='px-4 sm:px-6 max-w-screen-xl mx-auto w-full mb-4'>

      <QuestionDetails question={question} />

      <section className="button-section">
        <EditQuestionTrigger question={question}/>
        <DeleteButton deleteItemId={questionId} buttonLabel='Delete Question' deleteType='delete-question' className='delete-question-button'/> 
      </section>
    </div>
  );
};

export default page;
