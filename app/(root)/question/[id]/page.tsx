import { getQuestionById } from '@/lib/user-actions/questions';
import { notFound, redirect } from 'next/navigation';
import QuestionPageContent from '@/components/QuestionPageContent';

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const p = await params;
  const questionId = p.id;

  const result = await getQuestionById({ questionId });

  if (!result.success) {
    if (result.code === 'UNAUTHORIZED') {
      redirect('/sign-in');
    }

    if (result.code === 'NOT_FOUND') {
      notFound();
    }

    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Unable to Load Question
        </h2>

        <p className="text-gray-600 mb-6">
          This question could not be loaded right now. Please try again.
        </p>

        <a
          href={`/question/${questionId}`}
          className="all-questions-pagination-link"
        >
          Try Again
        </a>
      </div>
    );
  }

  if (!result.question) {
    notFound();
  }

  const question = {
    ...result.question,
    difficulty: result.question.difficulty,
  };

  return (
    <div className="px-4 sm:px-6 max-w-screen-xl mx-auto w-full mb-4">
      <QuestionPageContent
        question={question}
        questionId={questionId}
      />
    </div>
  );
};

export default page;