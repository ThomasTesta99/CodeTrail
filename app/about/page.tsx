'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const AboutPage  = () => {
  const router = useRouter();

  return (
    <div className="auth-screen">
      <div className="auth-container space-y-6">
        <h1 className="auth-header">About This App</h1>
        <p className="text-sm text-gray-300 leading-relaxed text-center">
          This application is designed to help you log and manage your LeetCode challenges.
          You can track your progress, record multiple attempts, and reflect on your
          solutions to build a stronger problem-solving foundation.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed text-center">
          Our goal is to make your learning journey more organized and insightful — turning
          practice into mastery over time.
        </p>

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

export default AboutPage ;
