'use client';

import { useRouter } from 'next/navigation';

const PrivacyPage = () => {
  const router = useRouter();

  return (
    <div className="auth-screen">
      <div className="auth-container space-y-6">
        <h1 className="auth-header">Privacy Policy</h1>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          CodeTrail collects information needed to provide the application,
          including account information such as your name and email address,
          along with the coding questions, attempts, notes, and other content
          you choose to save.
        </p>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          Your CodeTrail data is associated with your account and access to
          your saved questions and attempts is protected through authenticated
          user access controls.
        </p>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          When you request AI feedback, CodeTrail sends relevant information
          to OpenAI so that feedback can be generated. This may include your
          first name, question title and description, solution code,
          programming language, notes, attempt duration, whether help was
          needed, and information from previous attempts for the same question.
        </p>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          CodeTrail uses EmailJS to send account-related emails such as email
          verification and password reset messages. EmailJS may process your
          email address, your name when applicable, and verification or
          password-reset links in order to deliver these messages.
        </p>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          CodeTrail also relies on third-party service providers to operate
          the application, including services used for hosting, database
          storage, authentication, security, and abuse prevention. Information
          may be processed by these providers when necessary to provide and
          protect CodeTrail.
        </p>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          CodeTrail does not currently provide a self-service account deletion
          feature. This privacy policy will be updated when an account or data
          deletion process is made available.
        </p>

        <p className="text-sm text-gray-300 leading-relaxed text-center">
          By using CodeTrail, you acknowledge that your information may be
          processed as described above for the purpose of providing,
          maintaining, and securing the application.
        </p>

        <button
          onClick={() => router.back()}
          className="auth-submit-btn w-full"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default PrivacyPage;