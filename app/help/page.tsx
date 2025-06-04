'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const HelpPage = () => {
  const router = useRouter();

  return (
    <div className="auth-screen">
      <div className="auth-container space-y-6">
        <h1 className="auth-header">Help & FAQs</h1>
        <p className="text-sm text-gray-300 leading-relaxed text-center">
          Need assistance using the app? Here are some common questions:
        </p>
        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
          <li>➤ To add a question, click the “Add Question” button on your dashboard.</li>
          <li>➤ You can record multiple attempts per question to track progress.</li>
          <li>➤ Reset your password using the link on the login page.</li>
        </ul>

        <button
          onClick={() => router.back()}
          className="auth-submit-btn w-full"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default HelpPage;
