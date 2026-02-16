import axios from 'axios';

export const sendEmail = async (recipient: string, subject: string, message: string) => {
  try {
    const response = await axios.post(process.env.EMAIL_API!, {
      reciepient: recipient,
      subject,
      message,
    });
    return response;
  } catch {
    throw new Error('Error sending email');
  }
};
