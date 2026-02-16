const { verify } = require('jsonwebtoken');
const {
  verifyRefreshToken,
  createTokenWithPermissions,
  createToken,
} = require('./jwt');
const prisma = require('./prisma');

const serverSessionRouter = require('express').Router();

serverSessionRouter.get('/get-auth', (req, res) => {
  if (process.env.BYPASS_AUTH === 'true') {
    const mockUser = {
      name: 'Dev User',
      email: 'dev@user.com',
      permissions: [],
      institutionName: null,
      accessToken: 'dev-bypass-token',
      ghanaCardNumber: 'GHA-123456789-0',
    };
    return res.status(200).json(mockUser);
  }

  const bearer = req.headers.authorization || req.headers.Authorization;
  if (!bearer) return res.status(401).json('Authorization header missing');

  const accessToken = bearer.split(' ')[1];
  if (!accessToken) return res.status(401).json('Access token missing');

  try {
    const valid = verify(accessToken, process.env.JWT_SECRET);
    if (valid) {
      const user = {
        name: valid?.name,
        email: valid?.email,
        permissions: valid?.permissions,
        institutionName: valid?.institutionName,
        accessToken,
        ghanaCardNumber: valid?.ghanaCardNumber || '',
      };
      res.status(200).json(user);
    } else {
      return res.status(401).json('Invalid access token');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
});

serverSessionRouter.get('/refresh', async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;
    let accessToken;

    const publicUser = await prisma.user.findFirst({ where: { refreshToken } });
    if (publicUser) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, publicUser);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      accessToken = createToken(publicUser).accessToken;
      return res.status(200).json({ accessToken });
    }

    const institutionAdmin = await prisma.institutionAdmin.findFirst({
      where: { refreshToken },
      include: { institution: true },
    });
    if (institutionAdmin) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, institutionAdmin);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      accessToken = createTokenWithPermissions({
        ...institutionAdmin,
        institutionId: institutionAdmin.institution || institutionAdmin.institutionId,
      }).accessToken;
      return res.status(200).json({ accessToken });
    }

    const ecfatumAdmin = await prisma.ecfatumAdmin.findFirst({
      where: { refreshToken },
    });
    if (ecfatumAdmin) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, ecfatumAdmin);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      accessToken = createTokenWithPermissions(ecfatumAdmin).accessToken;
      return res.status(200).json({ accessToken });
    }

    const officer = await prisma.officer.findFirst({ where: { refreshToken } });
    if (officer) {
      const verifiedRefreshToken = verifyRefreshToken(refreshToken, officer);
      if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
      accessToken = createTokenWithPermissions(officer).accessToken;
      return res.status(200).json({ accessToken });
    }

    return res.status(403).json('Forbidden');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

serverSessionRouter.get('/logout', async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;

    const publicUser = await prisma.user.findFirst({ where: { refreshToken } });
    if (publicUser) {
      await prisma.user.update({
        where: { id: publicUser.id },
        data: { refreshToken: '' },
      });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    const institutionAdmin = await prisma.institutionAdmin.findFirst({
      where: { refreshToken },
    });
    if (institutionAdmin) {
      await prisma.institutionAdmin.update({
        where: { id: institutionAdmin.id },
        data: { refreshToken: '' },
      });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    const ecfatumAdmin = await prisma.ecfatumAdmin.findFirst({
      where: { refreshToken },
    });
    if (ecfatumAdmin) {
      await prisma.ecfatumAdmin.update({
        where: { id: ecfatumAdmin.id },
        data: { refreshToken: '' },
      });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    const officer = await prisma.officer.findFirst({ where: { refreshToken } });
    if (officer) {
      await prisma.officer.update({
        where: { id: officer.id },
        data: { refreshToken: '' },
      });
      res.clearCookie('jrft');
      return res.status(200).json('logged out');
    }

    if (!publicUser && !institutionAdmin && !ecfatumAdmin && !officer) {
      return res.status(403).json('Forbidden');
    }

    res.clearCookie('jrft');
    res.status(200).json('logged out');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

module.exports = serverSessionRouter;
