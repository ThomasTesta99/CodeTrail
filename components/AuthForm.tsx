'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { signInUser, signUpUser } from '@/lib/user-actions/authActions';

const signInSchema = z.object({
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(4, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInType = z.infer<typeof signInSchema>;
type SignUpType = z.infer<typeof signUpSchema>;
type AuthFormType = SignInType | SignUpType;

const handleGoogleSignIn = async () => {
  return await authClient.signIn.social({provider: 'google'});
}

const AuthForm = ({ type }: { type: 'sign-in' | 'sign-up' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthFormType>({
    resolver: zodResolver(type === 'sign-in' ? signInSchema : signUpSchema),
    defaultValues: type === 'sign-in'
      ? { email: '', password: '' }
      : { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: AuthFormType) => {
    setIsLoading(true);
    try {
      const userInfo = data as CreateUserInfo | SignInUserInfo;
      const result = type === 'sign-up'
        ? await signUpUser(userInfo as CreateUserInfo)
        : await signInUser(userInfo as SignInUserInfo);

      if (result && 'token' in result && result.token) {
        router.refresh(); // optional
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-header">&lt;CodeTrail /&gt;</h1>
      <h2 className="auth-title">{type === 'sign-in' ? 'Sign In' : 'Sign Up'}</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        {type === 'sign-up' && (
          <>
            <input
              type="text"
              placeholder="Name"
              {...form.register('name')}
              className="auth-input"
            />
            {'name' in form.formState.errors && (
              <p className="auth-error">{form.formState.errors.name?.message}</p>
            )}
          
          </>
        
        )}
  

        <input
          type="email"
          placeholder="Email"
          {...form.register('email')}
          className="auth-input"
        />
        {form.formState.errors.email && (
          <p className="auth-error">{form.formState.errors.email?.message}</p>
        )}

        <input
          type="password"
          placeholder="Password"
          {...form.register('password')}
          className="auth-input"
        />
        {form.formState.errors.password && (
          <p className="auth-error">{form.formState.errors.password?.message}</p>
        )}

        <button type="submit" disabled={isLoading} className="auth-submit-btn">
          {isLoading ? 'Loading...' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-footer-text">
        {type === 'sign-in' ? `Don't have an account? ` : `Already have an account? `}
        <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="auth-link">
          {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
        </Link>
      </p>

      {type === 'sign-in' && (
        <>
          <div className="auth-divider"></div>
          <button
            onClick={() => handleGoogleSignIn()}
            className="auth-google-btn"
          >
            <Image src="/assets/icons/google.svg" alt="Google" width={20} height={20} />
            Sign In with Google
          </button>
          <div className="auth-extra-links">
            <Link href="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthForm;
