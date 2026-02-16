const { verify } = require('jsonwebtoken');
const {
  verifyRefreshToken,
  createTokenWithPermissions,
  createToken,
} = require('./jwt');
const PublicUser = require('../models/general_users/user.model');
const InstitutionAdmin = require('../models/institutions/admin.model');
const EcfatumAdmin = require('../models/ecfatum/admin.model');
const Officer = require('../models/police/officer.model');

const serverSessionRouter = require('express').Router();

serverSessionRouter.get('/get-auth', (req, res) => {
  // DEV MODE BYPASS: Set BYPASS_AUTH=true in .env to bypass authentication
  if (process.env.BYPASS_AUTH === 'true') {
    // Return mock user data based on path or default to regular user
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
    let user;

    user = await PublicUser.findOne({ refreshToken });
    if (!user)
      user = await InstitutionAdmin.findOne({ refreshToken }).populate(
        'institutionId'
      );
    if (!user) user = await EcfatumAdmin.findOne({ refreshToken });
    if (!user) user = await Officer.findOne({ refreshToken });

    if (!user) return res.status(403).json('Forbidden');

    const verifiedRefreshToken = verifyRefreshToken(refreshToken, user);
    if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');

    let accessToken;
    if (user.provider === 'google' || user.provider === 'phoneNumber') {
      accessToken = createToken(user).accessToken;
    } else {
      accessToken = createTokenWithPermissions(user).accessToken;
    }

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

serverSessionRouter.get('/logout', async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;

    let user;
    user = await PublicUser.findOne({ refreshToken });
    if (!user) user = await InstitutionAdmin.findOne({ refreshToken });
    if (!user) user = await EcfatumAdmin.findOne({ refreshToken });
    if (!user) user = await Officer.findOne({ refreshToken });

    if (!user) return res.status(403).json('Forbidden');

    user.refreshToken = '';
    const result = await user.save();
    if (!result) return res.status(400).json('Logout Failed');
    res.clearCookie('jrft');
    res.status(200).json('logged out');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
});

module.exports = serverSessionRouter;
