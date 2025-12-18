import QuestionCard from '@/components/QuestionCard';
import QuestionFilterBar from '@/components/QuestionFilterBar';
import { QUESTIONS_PER_PAGE } from '@/constants';
import { getUserSession } from '@/lib/user-actions/authActions';
import { getAllUserQuestions, getQuestionLabels } from '@/lib/user-actions/questions';
import React from 'react';

type SearchParams = {
  page?: string,
  label: string,
  sort: SortKey
  q?: string, 
}

export type SortKey = "oldest" | "newest" | "difficultyAsc" | "difficultyDesc";

function buildHref(current: Record<string, string | undefined>, next: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  const merged = { ...current, ...next };

  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === "") continue;
    params.set(k, v);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const page = async ({searchParams}: {searchParams:Promise<SearchParams>}) => {
  const session = await getUserSession();
  const user = session?.user;
  const params = await searchParams;

  if (!user) {
    return (
      <div className="guest-container">
        <h1 className="guest-title">Welcome, Guest!</h1>
        <p className="guest-desc">Please sign in to see your questions.</p>
      </div>
    );
  }

  const pageNumber = parseInt(params.page || '1', 10);
  const offset = (pageNumber - 1) * QUESTIONS_PER_PAGE;
  const label = params.label || ""
  const sort: SortKey = params.sort || "newest"
  const q = params.q || "";

  const result = await getAllUserQuestions({ userId: user.id, limit: QUESTIONS_PER_PAGE + 1, offset , label, sort, q});
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

  const labelResult = await getQuestionLabels({userId: user.id});
  const labels = labelResult.labels;

  if(userQuestions.length === 0){
    return (
      <div className="all-questions-container">
        {q.length > 0 && (
          <div className="mt-20">
            <QuestionFilterBar labels = {labels}/>
          </div>
        )}
        <div className="all-questions-wrapper text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No Questions Found</h2>
          <p className="text-gray-600">
            {q.length === 0 ? "It looks like you have not added any questions yet. Start building your question library to keep track of your progress and revisit your toughest challenges." : ""}
          </p>
        </div>
      </div>
    );
  }

  const currentParams = {
    page: String(pageNumber),
    label: label || undefined, 
    sort: sort || undefined,
    q: q || undefined,
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

        <QuestionFilterBar labels = {labels}/>

        <section>
          <div className="all-questions-grid">
            {userQuestions.slice(0, QUESTIONS_PER_PAGE).map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>

        <div className="all-questions-pagination">
          {pageNumber > 1 && (
            <a 
                href={buildHref(currentParams, { page: String(pageNumber - 1) })} 
                className="all-questions-pagination-link"
              >
              Previous
            </a>
          )}
          {userQuestions.length > QUESTIONS_PER_PAGE && (
            <a 
                href={buildHref(currentParams, { page: String(pageNumber + 1) })} 
                className="all-questions-pagination-link"
              >
              Next
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
