import emailjs from '@emailjs/nodejs';

export const sendEmail = async ({
  to,
  resetLink,
}: {
  to: string;
  resetLink: string;
}) => {
  const serviceID = process.env.EMAILJS_SERVICE_ID!;
  const templateID = process.env.EMAILJS_RESET_TEMPLATE_ID!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC!;
  const privateKey = process.env.EMAILJS_PRIVATE!;
  
  const response = await emailjs.send(
    serviceID,
    templateID,
    {
      to_email: to,
      link: resetLink,
    },
    {
      publicKey,
      privateKey,
    }
  );


  return {
    success: true,
    message: response.text,
  };
};

interface VerificationProps {
    to: string;
    subject: string,
    templateParams: Record<string, string>
}

export const sendVerifiation = async ({
  to, 
  subject, 
  templateParams, 
}: VerificationProps) => {
  const serviceID = process.env.EMAILJS_SERVICE_ID!;
  const templateID = process.env.EMAILJS_VERIFY_TEMPLATE_ID!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC!;
  const privateKey = process.env.EMAILJS_PRIVATE!;

  const response = await emailjs.send(
    serviceID,
    templateID,
    {
      to_email: to,
      subject: subject,
      ...templateParams, 
    },
    {
      publicKey,
      privateKey,
    }
  );

  return {
    success: true,
    message: response.text,
  };
}