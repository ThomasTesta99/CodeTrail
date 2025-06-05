'use client';

import { authClient } from '@/lib/auth-client';
import { canChangePassword, getUserByEmail } from '@/lib/user-actions/authActions';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await getUserByEmail({ email });

      if (!result.user) {
        toast.error('No user found with that email')
        throw new Error("No user found with that email");
      }

      const canChangePasswordResult = await canChangePassword(email);

      if(canChangePasswordResult.canChange){
        await authClient.forgetPassword({
          email: email, 
          redirectTo: `${window.location.origin}/reset-password`,
        });
        toast.success("Reset link sent. Please check your email.")
      }else{
        toast.error(canChangePasswordResult.message);
      }

    } catch (error) {
      toast.error('Failed to send reset link.');
      console.log(error);
    }finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1 className="auth-header">Reset Password</h1>
        <p className="auth-title text-base font-normal text-gray-300">
          Enter your email and we will send you a link to reset your password.
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
