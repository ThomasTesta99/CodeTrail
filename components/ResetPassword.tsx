'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === '');
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing token');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      toast.success('Password has been reset. Please log in.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBorderClass = () =>
    confirmPassword === ''
      ? ''
      : passwordsMatch
      ? 'border-green-500'
      : 'border-red-500';

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
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`auth-input mt-2 ${inputBorderClass()}`}
          />
          {!passwordsMatch && confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
          {passwordsMatch && confirmPassword && (
            <p className="text-green-500 text-sm mt-1">Passwords match</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn mt-4"
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
