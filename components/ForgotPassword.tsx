'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
// import { sendResetEmail } from '@/lib/user-actions/authActions';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // const result = await sendResetEmail(email);

    // if (result.success) {
    //   toast.success(result.message || 'Reset link sent!');
    // } else {
    //   toast.error(result.message || 'Failed to send reset link');
    // }

    setIsSubmitting(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1 className="auth-header">Reset Password</h1>
        <p className="auth-title text-base font-normal text-gray-300">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-footer-text">
          Remembered your password?{' '}
          <a href="/login" className="auth-link">
            Go back to login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
