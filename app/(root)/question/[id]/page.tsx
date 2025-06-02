import QuestionDetails from '@/components/QuestionDetails';
import { getQuestionById } from '@/lib/user-actions/questions';
import { DeleteQuestionButton } from '@/components/DeleteQuestionButton';
import React from 'react'

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
    <div className='p-6 max-w-4xl'>
      <QuestionDetails question={question} />

      <section className="button-section">
        <button className="add-attempt-button">
          Add New Attempt
        </button>
        <DeleteQuestionButton questionId={question.id} />  {/* Use the Client Component */}
      </section>
    </div>
  );
};

export default page;
