import QuestionCard from '@/components/QuestionCard';
import { QUESTIONS_PER_PAGE } from '@/constants';
import { getUserSession } from '@/lib/user-actions/authActions';
import { getAllUserQuestions } from '@/lib/user-actions/questions';
import React from 'react';



const page = async ({searchParams}: {searchParams:{page?:string}}) => {
  const session = await getUserSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="guest-container">
        <h1 className="guest-title">Welcome, Guest!</h1>
        <p className="guest-desc">Please sign in to see your questions.</p>
      </div>
    );
  }

  const pageNumber = parseInt(searchParams.page || '1', 10);
  const offset = (pageNumber - 1) * QUESTIONS_PER_PAGE;

  const result = await getAllUserQuestions({ userId: user.id, limit: QUESTIONS_PER_PAGE + 1, offset });
  const userQuestions = result.questions.map(q => ({
    ...q,
    difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
    link: q.link ?? undefined,
    createdAt: q.createdAt ?? new Date(),
    attempts: q.attempts.map(a => ({
      ...a,
      notes: a.notes ?? '',
      createdAt: a.createdAt ?? new Date(),
    })),
  }));

  if(userQuestions.length === 0){
    return (
      <div className="all-questions-container">
        <div className="all-questions-wrapper text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No Questions Found</h2>
          <p className="text-gray-600">
            It looks like you have not added any questions yet. Start building your question library to keep track of your progress and revisit your toughest challenges.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-questions-container">
      <div className="all-questions-wrapper">
        <header className="all-questions-header">
          <h1 className="all-questions-title">All Questions</h1>
          <p className="all-questions-desc">
            Browse your submitted questions. Track progress and dive into problem-solving!
          </p>
        </header>

        <section>
          <div className="all-questions-grid">
            {userQuestions.slice(0, QUESTIONS_PER_PAGE).map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>

        <div className="all-questions-pagination">
          {pageNumber > 1 && (
            <a href={`?page=${pageNumber - 1}`} className="all-questions-pagination-link">
              Previous
            </a>
          )}
          {userQuestions.length > QUESTIONS_PER_PAGE && (
            <a href={`?page=${pageNumber + 1}`} className="all-questions-pagination-link">
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
