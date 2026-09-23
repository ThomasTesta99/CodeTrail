
'use client';

import { LANGUAGE_OPTIONS } from '@/constants';
import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Attempt, Question } from '@/types/types';
import type { AIFeedbackResponse } from '@/types/types';
import { DeleteButton } from './DeleteButton';
import AddAttemptTrigger from './AddAttemptTrigger';

const QuestionDetails = ({ question }: { question: Question }) => {
  const [attempts, setAttempts] = useState(question.attempts || []);
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0);

  const [feedback, setFeedback] = useState('');
  const [displayedFeedback, setDisplayedFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  const totalAttempts = attempts.length;
  const currentAttempt = attempts[currentAttemptIndex];

  const stopTyping = () => {
    if (typingIntervalRef.current !== null) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const clearFeedback = () => {
    stopTyping();
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    setFeedback('');
    setDisplayedFeedback('');
    setFeedbackError(null);
    setIsLoadingFeedback(false);
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current !== null) {
        clearInterval(typingIntervalRef.current);
      }

      requestControllerRef.current?.abort();
    };
  }, []);

  const handlePrev = () => {
    if (currentAttemptIndex === 0 || isLoadingFeedback) {
      return;
    }

    clearFeedback();

    setCurrentAttemptIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (
      currentAttemptIndex >= totalAttempts - 1 ||
      isLoadingFeedback
    ) {
      return;
    }

    clearFeedback();

    setCurrentAttemptIndex((prev) => prev + 1);
  };

  const getAIResponse = async () => {
    if (isLoadingFeedback || !currentAttempt) {
      return;
    }

    clearFeedback();
    setIsLoadingFeedback(true);

    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId: currentAttempt.id,
        }),
        signal: controller.signal,
      });

      const data: unknown = await res.json();

      if (controller.signal.aborted) {
        return;
      }

      if (
        typeof data !== 'object' ||
        data === null ||
        !('success' in data) ||
        typeof data.success !== 'boolean'
      ) {
        throw new Error('Invalid AI feedback response.');
      }

      const result = data as AIFeedbackResponse;

      if (!res.ok || !result.success) {
        const errorMessage =
          result.success === false &&
          typeof result.error === 'string' &&
          result.error.trim()
            ? result.error
            : 'Failed to get AI feedback. Please try again.';

        setFeedbackError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (
        typeof result.feedback !== 'string' ||
        !result.feedback.trim()
      ) {
        throw new Error('The AI returned an empty feedback response.');
      }

      const text = result.feedback;

      setFeedback(text);
      setDisplayedFeedback('');

      let index = 0;

      typingIntervalRef.current = setInterval(() => {
        index++;

        setDisplayedFeedback(text.slice(0, index));

        if (index >= text.length) {
          stopTyping();
        }
      }, 10);

    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      console.error(
        '[QuestionDetails] AI feedback failed:',
        error
      );

      const errorMessage =
        'Unable to retrieve AI feedback. Please try again.';

      setFeedbackError(errorMessage);
      toast.error(errorMessage);

    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsLoadingFeedback(false);
      }
    }
  };

  const handleAddAttempt = (newAttempt: Attempt) => {
    clearFeedback();

    setAttempts((prev) => [...prev, newAttempt]);
    setCurrentAttemptIndex(attempts.length);
  };

  const handleDeleteAttempt = (deletedAttemptId: string) => {
    clearFeedback();

    setAttempts((prev) =>
      prev.filter((attempt) => attempt.id !== deletedAttemptId)
    );

    setCurrentAttemptIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="question-container px-4 sm:px-6 w-full">
      <section className="question-header">
        <div className="flex flex-row justify-between items-center">
          <h1 className="question-title">
            {question.title}
          </h1>
        </div>

        <p className="question-description">
          {question.description}
        </p>

        <div className="question-tags">
          <span
            className={`difficulty-badge ${question.difficulty.toLowerCase()}`}
          >
            {question.difficulty}
          </span>

          {question.label !== 'unlabeled' &&
            question.label !== '' && (
              <p className="label-badge">
                {question.label}
              </p>
            )}

          {question.link && (
            <a
              href={question.link}
              className="leetcode-link"
            >
              View on LeetCode →
            </a>
          )}
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 mt-6 w-full">
        <section className="w-full lg:w-2/3 min-w-0 flex-1 attempt-section">
          <div className="flex flex-row justify-between">
            <h2 className="attempt-title">
              {totalAttempts > 0
                ? `Attempt ${currentAttemptIndex + 1} of ${totalAttempts}`
                : 'No attempts yet'}
            </h2>

            {currentAttempt && (
              <DeleteButton
                deleteItemId={currentAttempt.id}
                buttonLabel="Delete Attempt"
                deleteType="delete-attempt"
                className="delete-attempt-button"
                onDeleteSuccess={() => {
                  handleDeleteAttempt(currentAttempt.id);
                }}
              />
            )}
          </div>

          {currentAttempt ? (
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
                <p>
                  <span className="font-semibold">
                    Language:
                  </span>{' '}
                  {LANGUAGE_OPTIONS.find(
                    (opt) => opt.value === currentAttempt.language
                  )?.label || currentAttempt.language}
                </p>

                <p>
                  <span className="font-semibold">
                    Help Needed:
                  </span>{' '}
                  {currentAttempt.neededHelp ? 'Yes' : 'No'}
                </p>

                <p>
                  <span className="font-semibold">
                    Duration:
                  </span>{' '}
                  {currentAttempt.durationMinutes}{' '}
                  {currentAttempt.durationMinutes === 1
                    ? 'minute'
                    : 'minutes'}
                </p>

                <p>
                  <span className="font-semibold">
                    Notes:
                  </span>{' '}
                  {currentAttempt.notes || 'N/A'}
                </p>
              </div>

              <div className="nav-buttons">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={
                    currentAttemptIndex === 0 ||
                    isLoadingFeedback
                  }
                  className="nav-button"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    currentAttemptIndex === totalAttempts - 1 ||
                    isLoadingFeedback
                  }
                  className="nav-button"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center">
              No attempts recorded for this question yet.
            </p>
          )}

          <div className="button-section">
            <AddAttemptTrigger
              questionId={question.id}
              onAdd={handleAddAttempt}
            />
          </div>
        </section>

        <section className="w-full lg:flex-1 min-w-0">
          <div className="flex flex-col h-full bg-gray-800 p-4 rounded-xl text-sm text-white shadow-inner">
            <h3 className="text-lg font-semibold mb-2 text-white text-center">
              Feedback
            </h3>

            <div className="overflow-y-auto pr-2 flex-1 bg-gray-900 rounded-md p-3 border border-gray-700 space-y-2">
              {feedbackError ? (
                <div
                  role="alert"
                  className="rounded-md border border-red-500/50 bg-red-950/40 p-3"
                >
                  <p className="font-semibold text-red-300">
                    Unable to generate feedback
                  </p>

                  <p className="mt-1 text-sm text-red-200">
                    {feedbackError}
                  </p>
                </div>
              ) : feedback ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const {
                        inline,
                        className,
                        children,
                        ...rest
                      } = props as {
                        inline?: boolean;
                        className?: string;
                        children: React.ReactNode;
                      };

                      const match = /language-(\w+)/.exec(
                        className || ''
                      );

                      return !inline && match ? (
                        <SyntaxHighlighter
                          language={match[1]}
                          style={materialDark}
                          PreTag="div"
                          customStyle={{
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            maxWidth: '100%',
                            overflowX: 'auto',
                          }}
                          {...rest}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-700 px-1 py-0.5 rounded">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {displayedFeedback}
                </ReactMarkdown>
              ) : isLoadingFeedback ? (
                <p
                  className="text-gray-400 italic"
                  role="status"
                >
                  Generating AI feedback...
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  {totalAttempts === 0
                    ? 'Add an attempt to receive AI feedback.'
                    : 'No feedback yet.'}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={getAIResponse}
              disabled={
                isLoadingFeedback ||
                totalAttempts === 0
              }
              className="mt-4 cursor-pointer px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isLoadingFeedback
                ? 'Loading...'
                : 'Get Feedback'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QuestionDetails;