import QuestionCard from '@/components/QuestionCard'
import { fakeQuestions } from '@/constants'
import { getUserSession } from '@/lib/user-actions/authActions'
import Link from 'next/link'
import React from 'react'

const page = async () => {
  const session = await getUserSession();
  const user = session?.user; 
  const firstName = user ? user.name.split(' ')[0] : 'Guest';

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
            {fakeQuestions.slice(0, 6).map((question) => (
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
