import axios from 'axios';

export const sendSMS = async (number: string, message: string): Promise<string> => {
  try {
    const response = await axios.get(
      `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${process.env.SMS_API_USERNAME}&password=${process.env.SMS_API_PASSWORD}&type=0&dlr=1&destination=${number}&source=asset911&message=${message}`
    );
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  } catch {
    throw new Error('Error sending SMS');
  }
};
