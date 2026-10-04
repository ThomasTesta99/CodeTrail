import QuestionCard from '@/components/QuestionCard';
import QuestionFilterBar from '@/components/QuestionFilterBar';
import { QUESTIONS_PER_PAGE } from '@/constants';
import { getUserSession } from '@/lib/user-actions/authHelpers';
import { getAllUserQuestions, getQuestionLabels } from '@/lib/user-actions/questions';
import { SortKey } from '@/types/types';
import Link from 'next/link';

type SearchParams = {
  page?: string | string[];
  label?: string | string[];
  sort?: string | string[];
  q?: string | string[];
};

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
  const getSingleParam = (
    value: string | string[] | undefined
  ): string | undefined => {
    return typeof value === "string" ? value : undefined;
  };

  const rawPage = getSingleParam(params.page);
  const rawLabel = getSingleParam(params.label);
  const rawSort = getSingleParam(params.sort);
  const rawQuery = getSingleParam(params.q);

  if (!user) {
    return (
      <div className="guest-container">
        <h1 className="guest-title">Welcome, Guest!</h1>
        <p className="guest-desc">Please sign in to see your questions.</p>
      </div>
    );
  }

  const parsedPage = Number.parseInt(rawPage ?? "1", 10);

  const pageNumber =
    Number.isNaN(parsedPage) || parsedPage < 1
      ? 1
      : parsedPage

  const offset = (pageNumber - 1) * QUESTIONS_PER_PAGE;
  const label = rawLabel || "";

  const allowedSorts: SortKey[] = [
    "newest",
    "oldest",
    "difficultyAsc",
    "difficultyDesc",
  ];

  const sort: SortKey =
    rawSort && allowedSorts.includes(rawSort as SortKey)
      ? (rawSort as SortKey)
      : "newest";
      
  const q = rawQuery || "";
  const currentParams = {
    page: String(pageNumber),
    label: label || undefined,
    sort: sort || undefined,
    q: q || undefined,
  };

  const result = await getAllUserQuestions({ limit: QUESTIONS_PER_PAGE + 1, offset , label, sort, q});
  
  if (!result.success) {
    return (
      <div className="all-questions-container">
        <div className="all-questions-wrapper text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">
            Unable to Load Questions
          </h2>

          <p className="text-gray-600 mb-6">
            Your questions could not be loaded right now. Please try again.
          </p>

          <a
            href={buildHref(currentParams, {})}
            className="all-questions-pagination-link"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }
    
  const userQuestions = result.questions;

  const labelResult = await getQuestionLabels();
  const labels = labelResult.success
    ? labelResult.labels
    : [];

  const labelsFailed = !labelResult.success;
  

  if(userQuestions.length === 0){

    return (
      <div className="all-questions-container">
        {(q.trim().length > 0 || label.length > 0 || pageNumber > 1) && (
          <div className="mt-20">
            {labelsFailed && (
              <p className="mb-4 text-sm text-gray-500">
                Labels could not be loaded right now. Your questions are still available.
              </p>
            )}

            <QuestionFilterBar labels={labels} />
          </div>
        )}

        <div className="all-questions-wrapper text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">
            No Questions Found
          </h2>

          <p className="text-gray-600">
            {q.length === 0 && label.length === 0
              ? "It looks like you have not added any questions yet. Start building your question library to keep track of your progress and revisit your toughest challenges."
              : ""}
          </p>

          {pageNumber > 1 && (
            <div className="all-questions-pagination mt-6">
              <Link
                href={buildHref(currentParams, {
                  page: String(pageNumber - 1),
                })}
                className="all-questions-pagination-link"
              >
                Previous
              </Link>
            </div>
          )}
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

        {labelsFailed && (
          <p className="mb-4 text-sm text-gray-500">
            Labels could not be loaded right now. Your questions are still available.
          </p>
        )}

        <QuestionFilterBar labels={labels} />

        <section>
          <div className="all-questions-grid">
            {userQuestions.slice(0, QUESTIONS_PER_PAGE).map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>

        <div className="all-questions-pagination">
          {pageNumber > 1 && (
            <Link
              href={buildHref(currentParams, {
                page: String(pageNumber - 1),
              })}
              className="all-questions-pagination-link"
            >
              Previous
            </Link>
          )}

          {userQuestions.length > QUESTIONS_PER_PAGE && (
            <Link
              href={buildHref(currentParams, {
                page: String(pageNumber + 1),
              })}
              className="all-questions-pagination-link"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;
