import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { ecfatumPermissions } from '../../config/rolesAndPermissions';
import { createTokenWithPermissions } from '../../config/jwt';
import { sendRefreshToken } from '../../helpers/authHelpers';

const salt = bcrypt.genSaltSync(10);

export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const superAdmin = await prisma.ecfatumAdmin.findUnique({ where: { email } });
    if (!superAdmin) {
      const hashedPassword = bcrypt.hashSync(password, salt);
      await prisma.ecfatumAdmin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          institutionId: 'ecfatum',
          permissions: Object.values(ecfatumPermissions),
        },
      });
      return res.status(201).json('Admin created');
    }
    return res.status(400).json('Admin already exists');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const loginSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, otp } = req.body;
    const superAdmin = await prisma.ecfatumAdmin.findUnique({ where: { email } });
    if (superAdmin) {
      const isOtpValid = otp && superAdmin.seedOtp && otp === superAdmin.seedOtp;
      const isPasswordValid = password ? bcrypt.compareSync(password, superAdmin.password) : false;
      if (isPasswordValid || isOtpValid) {
        const { accessToken, refreshToken } = createTokenWithPermissions(superAdmin);
        sendRefreshToken(res, refreshToken);
        await prisma.ecfatumAdmin.update({
          where: { id: superAdmin.id },
          data: { refreshToken },
        });
        return res.status(200).json({ accessToken });
      }
    }
    return res.status(400).json('Invalid credentials');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};
