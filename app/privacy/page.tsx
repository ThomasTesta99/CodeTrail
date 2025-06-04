'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const PrivacyPage = () => {
  const router = useRouter();

  return (
    <div className="auth-screen">
      <div className="auth-container space-y-6">
        <h1 className="auth-header">Privacy Policy</h1>
        <p className="text-sm text-gray-300 leading-relaxed text-center">
          We value your privacy. Your data is never shared with third parties.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed text-center">
          All your question logs and attempts are stored securely and are only accessible
          by you. You can request deletion of your data at any time.
        </p>
        <p className="text-sm text-gray-300 leading-relaxed text-center">
          By using this app, you agree to our data collection for the sole purpose of
          helping you track and improve your coding skills.
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

export default PrivacyPage;
