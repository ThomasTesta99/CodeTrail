'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const passwordsMatch =
    password === confirmPassword || confirmPassword === '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || tokenError) {
      toast.error('Invalid password reset link.');
      return;
    }

    if (!password || !confirmPassword) {
      toast.error('Please enter your new password.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        if (
          error.code === 'INVALID_TOKEN' ||
          error.code === 'TOKEN_EXPIRED'
        ) {
          setTokenError(true);
          toast.error(
            'Your password reset link is invalid or expired.'
          );
          return;
        }

        toast.error(error.message || 'Failed to reset password');
        return;
      }

      toast.success('Password has been reset. Please log in.');
      router.push('/sign-in');
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

  const isInvalidToken = !token || tokenError;

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1 className="auth-header">Set New Password</h1>

        {isInvalidToken ? (
          <>
            <p className="auth-title text-base font-normal text-red-500">
              Your password reset link is invalid or expired.
              Please request a new one.
            </p>

            <Link
              href="/forgot-password"
              className="auth-link"
            >
              Request a new password reset link
            </Link>
          </>
        ) : (
          <>
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
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
                className={`auth-input mt-2 ${inputBorderClass()}`}
              />

              {!passwordsMatch && confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  Passwords do not match
                </p>
              )}

              {passwordsMatch && confirmPassword && (
                <p className="text-green-500 text-sm mt-1">
                  Passwords match
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-submit-btn mt-4"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer-text">
          Know your password?{' '}
          <Link href="/sign-in" className="auth-link">
            Go back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;