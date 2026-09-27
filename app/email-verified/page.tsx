import Link from "next/link";

const Page = async ({searchParams,}: {searchParams: Promise<{ error?: string }>;}) => {
  const { error } = await searchParams;
  const hasVerificationError = Boolean(error);

  return (
    <div className="auth-screen">
      <div className="auth-container text-center">
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              hasVerificationError
                ? "bg-red-500/20"
                : "bg-green-500/20"
            }`}
          >
            <span
              className={`text-3xl ${
                hasVerificationError
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {hasVerificationError ? "X" : "✓"}
            </span>
          </div>
        </div>

        <h1 className="auth-title">
          {hasVerificationError
            ? "Verification Failed"
            : "Email Verified"}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-gray-300">
          {hasVerificationError
            ? "This verification link is invalid or has expired. Please request a new verification email."
            : "Your email address has been successfully verified. You can now continue using CodeTrail."}
        </p>

        <Link
          href={hasVerificationError ? "/profile" : "/"}
          className="auth-submit-btn mt-6 block w-full text-center"
        >
          {hasVerificationError
            ? "Go to Profile"
            : "Continue to CodeTrail"}
        </Link>

        {!hasVerificationError && (
          <p className="auth-footer-text text-gray-300">
            Thanks for verifying your account.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;