import { getUserSession } from "@/lib/user-actions/authHelpers";
import Link from "next/link";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) => {
  const { error } = await searchParams;
  const session = await getUserSession();

  const hasVerificationError = Boolean(error);
  const isVerified = session?.user.emailVerified === true;

  const verificationState = hasVerificationError
    ? "error"
    : isVerified
      ? "success"
      : "unverified";

  const isSuccess = verificationState === "success";
  const isError = verificationState === "error";

  return (
    <div className="auth-screen">
      <div className="auth-container text-center">
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isSuccess ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            <span
              className={`text-3xl ${
                isSuccess ? "text-green-400" : "text-red-400"
              }`}
            >
              {isSuccess ? "✓" : "X"}
            </span>
          </div>
        </div>

        <h1 className="auth-title">
          {isError
            ? "Verification Failed"
            : isSuccess
              ? "Email Verified"
              : "Email Not Verified"}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-gray-300">
          {isError
            ? "This verification link is invalid or has expired. Please request a new verification email."
            : isSuccess
              ? "Your email address has been successfully verified. You can now continue using CodeTrail."
              : "Your email address has not been verified yet. Please use the verification link sent to your email."}
        </p>

        <Link
          href={isSuccess ? "/" : "/profile"}
          className="auth-submit-btn mt-6 block w-full text-center"
        >
          {isSuccess ? "Continue to CodeTrail" : "Go to Profile"}
        </Link>

        {isSuccess && (
          <p className="auth-footer-text text-gray-300">
            Thanks for verifying your account.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;