import { Question } from '@/types/types';
import Link from 'next/link';
import React from 'react'

const QuestionCard = ({ question }: { question: Question }) => {
  const attempts = question.attempts || [];
  const totalAtempts = attempts.length;
  const lastAttempt = totalAtempts > 0 
    ? attempts.reduce((latest, attempt) =>
        new Date(attempt.createdAt) > new Date(latest.createdAt) ? attempt : latest,
        attempts[0]
      )
    : null;

  return (
    <div className="question-card">
      <Link href={`/question/${question.id}`} className="question-card-link">
        <div>
          <div className="question-card-header">
            <h2 className="question-card-title">{question.title}</h2>
            <span className={`question-card-badge ${
              question.difficulty === 'Easy' ? 'bg-green-500/90 text-white' :
              question.difficulty === 'Medium' ? 'bg-yellow-500/90 text-black' :
              'bg-red-500/90 text-white'
            }`}>
              {question.difficulty}
            </span>
          </div>

          <p className="question-card-desc">{question.description}</p>

          <div className="question-card-footer">
            <span>{totalAtempts} Attempt{totalAtempts !== 1 ? 's' : ''}</span>
            <span>
              Last: {lastAttempt ? new Date(lastAttempt.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </Link>

      {question.link && (
        <a
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className="question-card-external"
        >
          View on LeetCode →
        </a>
      )}
    </div>
  );
};


export default QuestionCard
