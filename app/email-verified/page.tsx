import Link from 'next/link'

const page = () => {
  return (
    <div className="auth-screen">
      <div className="auth-container text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <span className="text-3xl text-green-400">✓</span>
          </div>
        </div>

        <h1 className="auth-title">
          Email Verified
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-gray-300">
          Your email address has been successfully verified.
          You can now continue using CodeTrail.
        </p>

        <Link
          href="/"
          className="auth-submit-btn mt-6 block w-full text-center"
        >
          Continue to CodeTrail
        </Link>

        <p className="auth-footer-text text-gray-300">
          Thanks for verifying your account.
        </p>
      </div>
    </div>
  )
}

export default page