import QuestionCard from '@/components/QuestionCard';
import { getUserSession } from '@/lib/user-actions/authActions';
import { getAllUserQuestions } from '@/lib/user-actions/questions';
import Link from 'next/link';
import React from 'react';

const page = async () => {
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

  const result = await getAllUserQuestions({ userId: user.id });
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
            {userQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>

        {/* Optional Pagination */}
        <div className="all-questions-pagination">
          <Link href={`?page=1`} className="all-questions-pagination-link">1</Link>
          <Link href={`?page=2`} className="all-questions-pagination-link">2</Link>
          {/* Add dynamic pagination if needed */}
        </div>
      </div>
    </div>
  );
};

export default page;
