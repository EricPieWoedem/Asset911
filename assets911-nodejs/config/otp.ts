import { sign, verify } from 'jsonwebtoken';

export const generateOTP = (length: number): string => {
  const characters = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    OTP += characters[index];
  }
  return OTP;
};

export const createOTPToken = (otp: string): string => {
  return sign({ otp }, process.env.JWT_SECRET!, { expiresIn: '5m' });
};

export const verifyOTPToken = (token: string): string | null => {
  const valid = verify(token, process.env.JWT_SECRET!) as { otp?: string };
  return valid?.otp ?? null;
};

export const createTransferToken = (otp: string): string => {
  return sign({ otp }, process.env.JWT_SECRET!, { expiresIn: '60m' });
};

export const verifyTransferToken = (token: string): string | null => {
  const valid = verify(token, process.env.JWT_SECRET!) as { otp?: string };
  return valid?.otp ?? null;
};
