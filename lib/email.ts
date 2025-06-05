export const sendEmail = async ({
  to,
  resetLink,
}: {
  to: string;
  resetLink: string;
}) => {
  const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY!;

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost',
    },
    body: JSON.stringify({
      service_id: serviceID,
      template_id: templateID,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: to,
        link: resetLink,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`EmailJS failed: ${error}`);
  }

  const successText = await response.text(); 
  return { success: true, message: successText };
};
