import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { createTokenWithPermissions } from '../../config/jwt';
import { sendRefreshToken } from '../../helpers/authHelpers';

const genSalt = bcrypt.genSaltSync(10);

export const registerOfficer = async (req: Request, res: Response) => {
  try {
    const existingOfficer = await prisma.officer.findUnique({
      where: { email: req.body.email },
    });
    if (existingOfficer) return res.status(409).json('Officer already exists');
    const hashedPassword = bcrypt.hashSync(req.body.password, genSalt);
    const officer = await prisma.officer.create({
      data: { ...req.body, password: hashedPassword },
    });
    if (officer) return res.status(200).json('Officer created successfully');
  } catch {
    res.status(500).send('Internal Server Error');
  }
};

export const loginOfficer = async (req: Request, res: Response) => {
  try {
    const officer = await prisma.officer.findUnique({
      where: { email: req.body.email },
    });
    if (!officer) return res.status(404).json('Officer not found');
    const isOtpValid = req.body.otp && officer.seedOtp && req.body.otp === officer.seedOtp;
    const isPasswordValid = req.body.password
      ? bcrypt.compareSync(req.body.password, officer.password)
      : false;
    if (!isPasswordValid && !isOtpValid) return res.status(401).json('Invalid password');
    const { accessToken, refreshToken } = createTokenWithPermissions({
      ...officer,
      institutionId: String((officer as { institutionId?: unknown }).institutionId ?? ''),
    });
    sendRefreshToken(res, refreshToken);
    await prisma.officer.update({
      where: { id: officer.id },
      data: { refreshToken },
    });
    res.status(200).json({
      accessToken,
      userProfile: {
        name: officer.name,
        email: officer.email,
        instututionName: officer.institutionId,
        institutionId: officer.institutionId,
      },
    });
  } catch {
    res.status(500).send('Internal Server Error');
  }
};
