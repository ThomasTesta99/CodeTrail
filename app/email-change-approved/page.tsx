import { getUserSession } from "@/lib/user-actions/authHelpers";
import Link from "next/link";

const Page = async ({searchParams}: {searchParams: Promise<{error?: string}>}) => {
  const { error } = await searchParams;
  const session = await getUserSession();
  const hasError = Boolean(error);

  return (
    <div className="auth-screen">
      <div className="auth-container text-center">
        <div className="mb-6 flex justify-center">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full ${hasError ? "bg-red-500/20" : "bg-green-500/20"}`}>
            <span className={`text-3xl ${hasError ? "text-red-400" : "text-green-400"}`}>{hasError ? "X" : "✓"}</span>
          </div>
        </div>

        <h1 className="auth-title">{hasError ? "Email Change Failed" : "Email Change Approved"}</h1>

        <p className="mt-4 text-sm leading-relaxed text-gray-300">
          {hasError
            ? "This email change approval link is invalid or has expired. Please request the email change again."
            : "Your current email has approved the change. A verification email has now been sent to your new email address. Verify it to finish changing your email."}
        </p>

        <Link href={session?.user ? "/settings" : "/sign-in"} className="auth-submit-btn mt-6 block w-full text-center">
          {session?.user ? "Back to Settings" : "Sign In"}
        </Link>
      </div>
    </div>
  );
};

export default Page;