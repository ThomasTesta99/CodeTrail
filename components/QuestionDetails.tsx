'use client';
import { LANGUAGE_OPTIONS } from '@/constants';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const QuestionDetails = ({ question }: { question: Question }) => {
  const attempts = question.attempts || [];
  const totalAttempts = attempts.length;
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0);

  const handlePrev = () => setCurrentAttemptIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrentAttemptIndex((prev) => (prev < totalAttempts - 1 ? prev + 1 : prev));

  return (
    <div className="question-container">
      <section className="question-header">
        <h1 className="question-title">{question.title}</h1>
        <p className="question-description">{question.description}</p>
        <div className="question-tags">
          <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
          {question.link && (
            <a href={question.link} className="leetcode-link">
              View on LeetCode →
            </a>
          )}
        </div>
      </section>

      <section className="attempt-section">
        <h2 className="attempt-title">
          {totalAttempts > 0
            ? `Attempt ${currentAttemptIndex + 1} of ${totalAttempts}`
            : 'No attempts yet'}
        </h2>

        {totalAttempts > 0 ? (() => {
          const currentAttempt = attempts[currentAttemptIndex];
          const langLabel =
            LANGUAGE_OPTIONS.find(opt => opt.value === currentAttempt.language)?.label ||
            currentAttempt.language;

          return (
            <>
              <SyntaxHighlighter
                language={currentAttempt.language || 'javascript'}
                style={materialDark}
                showLineNumbers
                wrapLines
                customStyle={{
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                {currentAttempt.solutionCode}
              </SyntaxHighlighter>

              <div className="attempt-details">
                <p><span className="font-semibold">Language:</span> {langLabel}</p>
                <p><span className="font-semibold">Help Needed:</span> {currentAttempt.neededHelp ? 'Yes' : 'No'}</p>
                <p><span className="font-semibold">Duration:</span> {currentAttempt.durationMinutes} minutes</p>
                <p><span className="font-semibold">Notes:</span> {currentAttempt.notes || 'N/A'}</p>
              </div>

              <div className="nav-buttons">
                <button onClick={handlePrev} disabled={currentAttemptIndex === 0} className="nav-button">Previous</button>
                <button onClick={handleNext} disabled={currentAttemptIndex === totalAttempts - 1} className="nav-button">Next</button>
              </div>
            </>
          );
        })() : (
          <p className="text-gray-600 text-center">No attempts recorded for this question yet.</p>
        )}
      </section>
    </div>
  );
};

export default QuestionDetails;
