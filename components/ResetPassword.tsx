'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing token');
      return;
    }

    setIsSubmitting(true);
    // const result = await resetPassword(token, password);
    setIsSubmitting(false);

    // if (result.success) {
    //   toast.success('Password has been reset. Please log in.');
    // } else {
    //   toast.error(result.message || 'Failed to reset password');
    // }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1 className="auth-header">Set New Password</h1>
        <p className="auth-title text-base font-normal text-gray-300">
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-footer-text">
          Know your password?{' '}
          <a href="/login" className="auth-link">
            Go back to login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
