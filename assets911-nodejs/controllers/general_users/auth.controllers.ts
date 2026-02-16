import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { createToken, decode, verifyRefreshToken } from '../../config/jwt';
import { sendSMS } from '../../utils/sms';
import { generateOTP } from '../../config/otp';
import { sendRefreshToken } from '../../helpers/authHelpers';

const salt = bcrypt.genSaltSync(10);

export const socialAuth = async (req: Request, res: Response) => {
  try {
    const userInfo = (decode(req.body.user) as Record<string, unknown>) || req.body;
    const userProfile: { name: string; email: string; picture?: string; ghanaCardNumber?: string } = {
      name: userInfo.name as string,
      email: userInfo.email as string,
      picture: userInfo.picture as string | undefined,
    };
    let existingUser = await prisma.user.findFirst({ where: { email: userInfo.email as string } });
    if (existingUser) {
      const isPasswordValid = bcrypt.compareSync(userInfo.sub as string, existingUser.password);
      if (!isPasswordValid) return res.status(409).json('Invalid credentials');
      const { accessToken, refreshToken } = createToken(existingUser);
      existingUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { refreshToken },
      });
      sendRefreshToken(res, refreshToken);
      userProfile.ghanaCardNumber = existingUser.ghanaCardNumber || '';
      return res.status(200).json({ accessToken, userProfile });
    }
    const hashedPassword = bcrypt.hashSync(userInfo.sub as string, salt);
    const newUser = await prisma.user.create({
      data: {
        provider: 'google',
        password: hashedPassword,
        email: userInfo.email as string,
        name: userInfo.name as string,
        image: userInfo.picture as string | undefined,
      },
    });
    const { accessToken, refreshToken } = createToken(newUser);
    await prisma.user.update({ where: { id: newUser.id }, data: { refreshToken } });
    sendRefreshToken(res, refreshToken);
    return res.status(200).json({ accessToken, userProfile });
  } catch {
    return res.status(500).json('Internal server error');
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(403).json('Forbidden');
    const verifiedRefreshToken = verifyRefreshToken(refreshToken, user);
    if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
    const accessToken = createToken(user).accessToken;
    res.status(200).json({ accessToken });
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const logOutUser = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(403).json('Forbidden');
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: '' } });
    res.clearCookie('jrft');
    res.status(200).json('logged out');
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const phoneNumberAuthentication = async (req: Request, res: Response) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { phoneNumber: req.body.phoneNumber },
    });
    const otp = generateOTP(4);
    const smsConfigured = Boolean(process.env.SMS_API_USERNAME && process.env.SMS_API_PASSWORD);
    if (existingUser) {
      await prisma.user.update({ where: { id: existingUser.id }, data: { seedOtp: otp } });
    } else {
      await prisma.user.create({
        data: {
          phoneNumber: req.body.phoneNumber,
          password: bcrypt.hashSync(otp, salt),
          provider: 'phoneNumber',
          seedOtp: otp,
        },
      });
    }
    if (!smsConfigured) {
      return res.status(200).json({ phoneNumber: req.body.phoneNumber, otp });
    }
    const message = `${otp} is your OTP valid for 5mins. Welcome to ASSETS911.`;
    const smsResult = await sendSMS(req.body.phoneNumber, message);
    const numberToTest = req.body.phoneNumber.substring(1);
    if (typeof smsResult !== 'string' || !smsResult.includes(numberToTest)) {
      return res.status(500).json('Failed to send otp');
    }
    return res.status(200).json(req.body.phoneNumber);
  } catch {
    res.status(500).json('Internal server error');
  }
};

export const verifyUserOTP = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { phoneNumber: req.body.phoneNumber, provider: 'phoneNumber' },
    });
    if (!user) return res.status(404).json('Not found');
    if (req.body.otp === user.seedOtp) {
      const { accessToken, refreshToken } = createToken(user);
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken, seedOtp: null },
      });
      sendRefreshToken(res, refreshToken);
      const userProfile = {
        name: user?.name,
        email: user.email,
        picture: user?.image ?? undefined,
        ghanaCardNumber: user.ghanaCardNumber || '',
      };
      res.status(200).json({ accessToken, userProfile });
    } else {
      res.status(400).json('Invalid OTP');
    }
  } catch {
    res.status(500).json('Internal server error');
  }
};
