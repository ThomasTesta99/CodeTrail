export const getAuthErrorMessage = (
  code?: string | null,
  fallback = 'Authentication failed. Please try again.'
): string => {
  switch (code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password.';

    case 'EMAIL_NOT_VERIFIED':
      return 'Please verify your email before signing in.';

    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'An account with this email already exists.';

    case 'PASSWORD_TOO_SHORT':
      return 'Your password does not meet the minimum length requirement.';

    case 'TOO_MANY_REQUESTS':
      return 'Too many attempts. Please try again later.';

    case 'INVALID_TOKEN':
    case 'TOKEN_EXPIRED':
      return 'Your password reset link is invalid or expired.';

    default:
      return fallback;
  }
};