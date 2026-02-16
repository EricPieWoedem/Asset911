import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { createTokenWithPermissions } from '../../config/jwt';
import { sendRefreshToken } from '../../helpers/authHelpers';

type AuthReq = Request & { institutionId: string };

const salt = bcrypt.genSaltSync(12);

export const createAdmin = async (req: Request, res: Response) => {
  const { name, email, permissions, password } = req.body;
  try {
    const institutionId = (req as AuthReq).institutionId;
    const exisitingAdmin = await prisma.institutionAdmin.findFirst({
      where: { email, institutionId },
    });
    if (exisitingAdmin) return res.status(400).json(exisitingAdmin);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newAdmin = await prisma.institutionAdmin.create({
      data: {
        name,
        permissions,
        email,
        password: hashedPassword,
        institutionId,
      },
    });
    if (!newAdmin) return res.status(400).json('Failed to create Admin');
    res.status(201).json('Admin created');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, otp } = req.body;
  try {
    const admin = await prisma.institutionAdmin.findUnique({
      where: { email },
      include: { institution: true },
    });
    if (!admin) return res.status(400).json('Invalid Credentials');
    const isOtpValid = otp && admin.seedOtp && otp === admin.seedOtp;
    const isPasswordValid = password ? bcrypt.compareSync(password, admin.password) : false;
    if (isPasswordValid || isOtpValid) {
      const adminProfile = { name: admin.name, email: admin.email };
      const tokenPayload = {
        ...admin,
        institutionId: admin.institution ?? admin.institutionId,
      };
      const { accessToken, refreshToken } = createTokenWithPermissions(tokenPayload);
      sendRefreshToken(res, refreshToken);
      await prisma.institutionAdmin.update({
        where: { id: admin.id },
        data: { refreshToken },
      });
      res.status(200).json({ accessToken, adminProfile });
    } else {
      res.status(400).json('Invalid Credentials');
    }
  } catch {
    res.status(500).json('Internal Server Error');
  }
};
