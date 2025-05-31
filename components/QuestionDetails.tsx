'use client'
import React, { useState } from 'react'

const QuestionDetails = ({ question }: { question: Question }) => {
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState(0)
  const totalAttempts = question.attempts.length
  const currentAttempt = question.attempts[currentAttemptIndex]

  const handlePrev = () => {
    setCurrentAttemptIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentAttemptIndex((prev) => (prev < totalAttempts - 1 ? prev + 1 : prev))
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Question Details Section */}
      <section className="bg-[#2C325D] text-white rounded-3xl p-8 shadow-lg space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">{question.title}</h1>
        <p className="text-base leading-relaxed">{question.description}</p>
        <div className="flex gap-6 text-sm font-medium">
          <span className="px-3 py-1 bg-green-500/90 rounded-full">
            {question.difficulty}
          </span>
          {question.link && (
            <a href={question.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-300 transition">
              View on LeetCode →
            </a>
          )}
        </div>
      </section>

      {/* Attempt Details Section */}
      <section className="bg-gray-100 rounded-3xl p-6 shadow space-y-4">
        <h2 className="text-2xl font-semibold text-[#2C325D]">
          Attempt {currentAttemptIndex + 1} of {totalAttempts}
        </h2>
        <pre className="bg-gray-200 p-4 rounded text-sm font-mono overflow-x-auto">
          {currentAttempt.solutionCode}
        </pre>
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Help Needed:</strong> {currentAttempt.neededHelp ? 'Yes' : 'No'}</p>
          <p><strong>Duration:</strong> {currentAttempt.durationMinutes} minutes</p>
          <p><strong>Notes:</strong> {currentAttempt.notes}</p>
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrev}
            disabled={currentAttemptIndex === 0}
            className="px-4 py-2 bg-[#2C325D] text-white rounded-lg disabled:opacity-50 transition hover:bg-[#3B3F6A] cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentAttemptIndex === totalAttempts - 1}
            className="px-4 py-2 bg-[#2C325D] text-white rounded-lg disabled:opacity-50 transition hover:bg-[#3B3F6A] cursor-pointer"
          >
            Next
          </button>
        </div>
      </section>

      {/* Add New Attempt Button */}
      <section className="flex justify-center">
        <button className="px-6 py-3 bg-[#2C325D] text-white rounded-full hover:bg-[#3B3F6A] transition font-semibold">
          Add New Attempt
        </button>
      </section>
    </div>
  )
}

export default QuestionDetails
