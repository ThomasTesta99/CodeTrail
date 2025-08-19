'use client';
import { LANGUAGE_OPTIONS } from '@/constants';
import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';
import { Attempt, Question } from '@/types/types';
import { DeleteButton } from './DeleteButton';
import AddAttemptTrigger from './AddAttemptTrigger';

const QuestionDetails = ({ question }: { question: Question }) => {
  const [attempts, setAttempts] = useState(question.attempts || []);
  const totalAttempts = attempts.length;
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [displayedFeedback,setDisplayedFeedback] = useState('')

  const handlePrev = () => setCurrentAttemptIndex((prev) => (prev > 0 ? prev - 1 : prev));
  const handleNext = () => setCurrentAttemptIndex((prev) => (prev < totalAttempts - 1 ? prev + 1 : prev));

  const getAIResponse = async () => {
    setIsLoadingFeedback(true);
    setDisplayedFeedback('');
    setFeedback('');
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

      if(data?.rateLimit && !data.rateLimit.valid){
        toast.error(data.rateLimit.message);
        return;
      }
      setFeedback(data.feedback);
      setDisplayedFeedback(data.feedback.charAt(0));

      let i = 0;
      const text = data.feedback;
      setFeedback(text);
      const interval = setInterval(() => {
        setDisplayedFeedback((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 10);
    } catch (error) {
      console.log(error);
      setFeedback('Failed to get feedback.');
    }finally {
      setIsLoadingFeedback(false);
    }
  }

  useEffect(() => {
    const newAttempts = question.attempts ?? [];
    setAttempts(newAttempts);
  }, [question.attempts])

  const handleAddAttempt = (newAttempt: Attempt) => {
    setAttempts((prev) => [...prev, newAttempt]);
    setCurrentAttemptIndex(attempts.length);
  };

  return (
    <div className="question-container px-4 sm:px-6 w-full">
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
        <section className="w-full lg:w-2/3 min-w-0 flex-1 attempt-section">

          <div className = "flex flex-row justify-between">
            <h2 className="attempt-title">
              {totalAttempts > 0
                ? `Attempt ${currentAttemptIndex + 1} of ${totalAttempts}`
                : 'No attempts yet'}
            </h2>
            {attempts.length > 0 ? 
              <DeleteButton 
                deleteItemId={attempts[currentAttemptIndex].id} 
                buttonLabel='Delete Attempt' 
                deleteType='delete-attempt' 
                className='delete-attempt-button'
                onDeleteSuccess={() => {
                  const updated = [...attempts];
                  updated.splice(currentAttemptIndex, 1);
                  setAttempts(updated);
                  setCurrentAttemptIndex((prev) => Math.max(prev - 1, 0));
                }}
              />
              : <></>
            }
          </div>

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
          <div className='button-section'>
            <AddAttemptTrigger questionId={question.id} onAdd={handleAddAttempt}/>
          </div>
        </section>
        <section className="w-full lg:flex-1 min-w-0">
          <div className="flex flex-col h-full bg-gray-800 p-4 rounded-xl text-sm text-white shadow-inner">
            <h3 className="text-lg font-semibold mb-2 text-white text-center">Feedback</h3>

            <div className="overflow-y-auto pr-2 flex-1 bg-gray-900 rounded-md p-3 border border-gray-700 space-y-2">
              {feedback ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { inline, className, children, ...rest } = props as {
                        inline?: boolean;
                        className?: string;
                        children: React.ReactNode;
                      };

                      const match = /language-(\w+)/.exec(className || '');

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
              ) : (
                <p className="text-gray-400 italic">No feedback yet.</p>
              )}
            </div>

            <button
              onClick={getAIResponse}
              disabled={isLoadingFeedback}
              className="mt-4 cursor-pointer px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isLoadingFeedback ? 'Loading...' : 'Get Feedback'}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default QuestionDetails;
