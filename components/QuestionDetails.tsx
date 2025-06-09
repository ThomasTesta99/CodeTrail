'use client';
import { LANGUAGE_OPTIONS } from '@/constants';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const QuestionDetails = ({ question }: { question: Question }) => {
  const attempts = question.attempts || [];
  const totalAttempts = attempts.length;
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const handlePrev = () => setCurrentAttemptIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrentAttemptIndex((prev) => (prev < totalAttempts - 1 ? prev + 1 : prev));

  const getAIResponse = async () => {
    setIsLoadingFeedback(true);
    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          code: attempts[currentAttemptIndex].solutionCode, 
          notes: attempts[currentAttemptIndex].notes, 
          questionTitle: question.title, 
          questionDescription: question.description, 
          language: attempts[currentAttemptIndex].language, 
          neededHelp: attempts[currentAttemptIndex].neededHelp, 
          durationMinutes: attempts[currentAttemptIndex].durationMinutes, 
          allAttempts: question.attempts
        }),
      });

      const data = await res.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.log(error);
      setFeedback('Failed to get feedback.');
    }finally {
      setIsLoadingFeedback(false);
    }
  }

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

      <div className='flex flex-col lg:flex-row gap-8 mt-6 w-full'>
        <section className="w-full lg:flex-[2] attempt-section">
        <h2 className="attempt-title">
          {totalAttempts > 0
            ? `Attempt ${currentAttemptIndex + 1} of ${totalAttempts}`
            : 'No attempts yet'}
        </h2>

        {totalAttempts > 0 ? (() => {
          const currentAttempt = attempts[currentAttemptIndex];
          const languageLabel =
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
                <p><span className="font-semibold">Language:</span> {languageLabel}</p>
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
        <section className="w-full lg:max-w-sm">
          <div className="flex flex-col bg-gray-800 p-4 rounded-xl text-sm text-white shadow-inner h-full max-h-[400px]">
            <h3 className="text-lg font-semibold mb-2 text-white">AI Feedback</h3>

            <button
              onClick={getAIResponse}
              className="btn btn-secondary mb-3 w-fit self-start"
            >
              {isLoadingFeedback ? 'Loading...' : 'Get AI Feedback'}
            </button>

            <div className="overflow-y-auto pr-2 flex-1 bg-gray-900 rounded-md p-3 border border-gray-700 space-y-2">
              {feedback ? (
                feedback.split('\n').map((line, idx) => (
                  <p key={idx} className="text-gray-100 leading-relaxed">
                    {line.trim()}
                  </p>
                ))
              ) : (
                <p className="text-gray-400 italic">No feedback yet.</p>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default QuestionDetails;
