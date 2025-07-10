import QuestionCard from '@/components/QuestionCard'
import { getUserSession } from '@/lib/user-actions/authActions'
import { getMostRecentUserQuestions } from '@/lib/user-actions/questions'
import Link from 'next/link'
import React from 'react'

const page = async () => {
  const session = await getUserSession();
  const user = session?.user; 
  const firstName = user ? user.name.split(' ')[0] : 'Guest';

  if (!user?.id) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-main">
          <h1>Welcome, Guest!</h1>
          <p>Please sign in to see your questions.</p>
        </main>
      </div>
    );
  }
  const result = await getMostRecentUserQuestions({userId : user.id, limit: 6});
  if(!result.success){
    return (
      <div className="dashboard-container">
        <main className="dashboard-main">
          <h1>Welcome, {firstName}!</h1>
          <p>Could not load your questions. {result.message || 'Please try again later.'}</p>
        </main>
      </div>
    );
  }

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
      <div className="dashboard-container">
        <main className="dashboard-main">
          <header className="dashboard-header">
          <h1 className="dashboard-header-title">
            Welcome, {firstName}!
          </h1>
          <p className="dashboard-header-desc">
            Empower your coding journey. Log your technical challenges, track attempts, and reflect on your problem-solving skills. Discover what works best and achieve mastery!
          </p>
        </header>
        <p className="dashboard-header-desc text-center">
          Ready to level up? Add your first technical question and take the first step toward mastering problem-solving.
        </p>
        </main>
      </div>
    );
  }


  return (
    <div className="dashboard-container">

      <main className="dashboard-main">

        <header className="dashboard-header">
          <h1 className="dashboard-header-title">
            Welcome, {firstName}!
          </h1>
          <p className="dashboard-header-desc">
            Empower your coding journey. Log your LeetCode challenges, track attempts, and reflect on your problem-solving skills. Discover what works best and achieve mastery!
          </p>
        </header>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">
            Your Most Recent Questions
          </h2>
          <div className="dashboard-grid">
            {userQuestions.slice(0, 6).map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} CodeTrail. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/about" className="dashboard-footer-link">
            About
          </Link>
          <Link href="/help" className="dashboard-footer-link">
            Help
          </Link>
          <Link href="/privacy" className="dashboard-footer-link">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default page
