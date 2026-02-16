import { Router, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { verifyRefreshToken, createTokenWithPermissions, createToken } from './jwt';
import prisma from './prisma';

const serverSessionRouter = Router();

serverSessionRouter.get('/get-auth', (req: Request, res: Response) => {
  if (process.env.BYPASS_AUTH === 'true') {
    return res.status(200).json({
      name: 'Dev User',
      email: 'dev@user.com',
      permissions: [],
      institutionName: null,
      accessToken: 'dev-bypass-token',
      ghanaCardNumber: 'GHA-123456789-0',
    });
  }
  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer) return res.status(401).json('Authorization header missing');
  const accessToken = (bearer as string).split(' ')[1];
  if (!accessToken) return res.status(401).json('Access token missing');
  try {
    const valid = verify(accessToken, process.env.JWT_SECRET!) as Record<string, unknown>;
    if (valid) {
      res.status(200).json({
        name: valid?.name,
        email: valid?.email,
        permissions: valid?.permissions,
        institutionName: valid?.institutionName,
        accessToken,
        ghanaCardNumber: (valid?.ghanaCardNumber as string) || '',
      });
    } else {
      res.status(401).json('Invalid access token');
    }
  } catch {
    res.status(500).json('Internal Server Error');
  }
});

serverSessionRouter.get('/refresh', async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;

    const publicUser = await prisma.user.findFirst({ where: { refreshToken } });
    if (publicUser) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, publicUser);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      const { accessToken } = createToken(publicUser);
      return res.status(200).json({ accessToken });
    }

    const institutionAdmin = await prisma.institutionAdmin.findFirst({
      where: { refreshToken },
      include: { institution: true },
    });
    if (institutionAdmin) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, institutionAdmin);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      const inst = institutionAdmin.institution;
      const { accessToken } = createTokenWithPermissions({
        ...institutionAdmin,
        institutionId: inst ? { id: inst.id, name: inst.name } : (institutionAdmin.institutionId ?? ''),
      });
      return res.status(200).json({ accessToken });
    }

    const ecfatumAdmin = await prisma.ecfatumAdmin.findFirst({ where: { refreshToken } });
    if (ecfatumAdmin) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, ecfatumAdmin);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      const { accessToken } = createTokenWithPermissions(ecfatumAdmin);
      return res.status(200).json({ accessToken });
    }

    const officer = await prisma.officer.findFirst({ where: { refreshToken } });
    if (officer) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, officer);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      const { accessToken } = createTokenWithPermissions({
        ...officer,
        permissions: [],
        institutionId: String((officer as { institutionId?: unknown }).institutionId ?? ''),
      });
      return res.status(200).json({ accessToken });
    }

    return res.status(403).json('Forbidden');
  } catch {
    res.status(500).json('Internal server error');
  }
});

serverSessionRouter.get('/logout', async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;

    const publicUser = await prisma.user.findFirst({ where: { refreshToken } });
    if (publicUser) {
      await prisma.user.update({ where: { id: publicUser.id }, data: { refreshToken: '' } });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    const institutionAdmin = await prisma.institutionAdmin.findFirst({ where: { refreshToken } });
    if (institutionAdmin) {
      await prisma.institutionAdmin.update({ where: { id: institutionAdmin.id }, data: { refreshToken: '' } });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    const ecfatumAdmin = await prisma.ecfatumAdmin.findFirst({ where: { refreshToken } });
    if (ecfatumAdmin) {
      await prisma.ecfatumAdmin.update({ where: { id: ecfatumAdmin.id }, data: { refreshToken: '' } });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    const officer = await prisma.officer.findFirst({ where: { refreshToken } });
    if (officer) {
      await prisma.officer.update({ where: { id: officer.id }, data: { refreshToken: '' } });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    res.clearCookie('jrft');
    res.status(200).json('logged out');
  } catch {
    res.status(500).json('Internal server error');
  }
});

export default serverSessionRouter;
