const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const { createToken, decode, verifyRefreshToken } = require('../../config/jwt');
const { sendSMS } = require('../../utils/sms');
const { generateOTP } = require('../../config/otp');

const salt = bcrypt.genSaltSync(10);

const sendRefreshToken = (res, refreshToken) => {
  res.cookie('jrft', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const socialAuth = async (req, res) => {
  try {
    const userInfo = decode(req.body.user) || req.body;
    const userProfile = {
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    };

    let existingUser = await prisma.user.findFirst({
      where: { email: userInfo.email },
    });

    if (existingUser) {
      const isPasswordValid = bcrypt.compareSync(userInfo.sub, existingUser.password);
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

    const hashedPassword = bcrypt.hashSync(userInfo.sub, salt);
    const newUser = await prisma.user.create({
      data: {
        provider: 'google',
        password: hashedPassword,
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.picture,
      },
    });

    const { accessToken, refreshToken } = createToken(newUser);
    await prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });
    sendRefreshToken(res, refreshToken);
    return res.status(200).json({ accessToken, userProfile });
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
};

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(403).json('Forbidden');
    const verifiedRefreshToken = verifyRefreshToken(refreshToken, user);
    if (!verifiedRefreshToken) return res.status(401).json('Unauthorized');
    const accessToken = createToken(user).accessToken;
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const logOutUser = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) return res.status(403).json('Forbidden');
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: '' },
    });
    res.clearCookie('jrft');
    res.status(200).json('logged out');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const phoneNumberAuthentication = async (req, res) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { phoneNumber: req.body.phoneNumber },
    });
    const otp = generateOTP(4);
    const smsConfigured = Boolean(
      process.env.SMS_API_USERNAME && process.env.SMS_API_PASSWORD
    );

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { seedOtp: otp },
      });
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
      return res.status(200).json({
        phoneNumber: req.body.phoneNumber,
        otp,
      });
    }

    const message = `${otp} is your OTP valid for 5mins. Welcome to ASSETS911.`;
    const numberToTest = req.body.phoneNumber.substring(1);
    const smsResult = await sendSMS(req.body.phoneNumber, message);
    if (!smsResult.includes(numberToTest)) {
      return res.status(500).json('Failed to send otp');
    }
    return res.status(200).json(req.body.phoneNumber);
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const verifyUserOTP = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        phoneNumber: req.body.phoneNumber,
        provider: 'phoneNumber',
      },
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
        picture: user?.picture,
      };
      userProfile.ghanaCardNumber = user.ghanaCardNumber || '';
      res.status(200).json({ accessToken, userProfile });
    } else {
      res.status(400).json('Invalid OTP');
    }
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

module.exports = {
  socialAuth,
  refreshToken,
  logOutUser,
  phoneNumberAuthentication,
  verifyUserOTP,
};
