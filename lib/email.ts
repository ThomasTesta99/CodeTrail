import emailjs from '@emailjs/nodejs';

export const sendEmail = async ({
  to,
  resetLink,
}: {
  to: string;
  resetLink: string;
}) => {
  const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const templateID = process.env.EMAILJS_TEMPLATE_ID!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY!;
  
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

  console.log(response);

  return {
    success: true,
    message: response.text,
  };
};