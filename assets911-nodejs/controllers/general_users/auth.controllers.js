const User = require('../../models/general_users/user.model');
const bcrypt = require('bcryptjs');
const { createToken, decode, verifyRefreshToken } = require('../../config/jwt');
const { sendSMS } = require('../../utils/sms');
const {
  createOTPToken,
  verifyOTPToken,
  generateOTP,
} = require('../../config/otp');

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
  const userInfo = decode(req.body.user) || req.body;

  const userProfile = {
    name: userInfo.name,
    email: userInfo.email,
    picture: userInfo.picture,
  };
  const existingUser = await User.findOne({
    email: userInfo.email,
  });
  if (existingUser) {
    const isPasswordValid = bcrypt.compareSync(
      userInfo.sub,
      existingUser.password
    );
    if (!isPasswordValid) return res.status(409).json('Invalid credentials');
    const { accessToken, refreshToken } = createToken(existingUser);

    existingUser.refreshToken = refreshToken;
    const result = await existingUser.save();

    if (!result) return res.status(400).json('Login Failed');

    res.cookie('jrft', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });
    userProfile.ghanaCardNumber = existingUser.ghanaCardNumber || '';
    res.status(200).json({ accessToken, userProfile });
  } else {
    const hashedPassword = bcrypt.hashSync(userInfo.sub, salt);
    const newUser = await User.create({
      provider: 'google',
      password: hashedPassword,
      email: userInfo.email,
      name: userInfo.name,
      image: userInfo.picture,
      type: 'user',
    });
    if (newUser) {
      const { accessToken, refreshToken } = createToken(newUser);

      newUser.refreshToken = refreshToken;
      const result = await newUser.save();

      if (!result) return res.status(400).json('Login Failed');

      sendRefreshToken(res, refreshToken);

      res.status(200).json({ accessToken, userProfile });
    } else {
      res.status(400).json('Internal Server Error');
    }
  }
};

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies.jrft) return res.status(401).json('Unauthorized');
    const refreshToken = cookies.jrft;
    const user = await User.findOne({ refreshToken });
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
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json('Forbidden');
    user.refreshToken = '';
    const result = await user.save();
    if (!result) return res.status(400).json('Logout Failed');
    res.clearCookie('jrft');
    res.status(200).json('logged out');
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const phoneNumberAuthentication = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });

    const otp = generateOTP(4);
    const otpToken = createOTPToken(otp);
    const message = `${otp} is your OTP valid for 5mins. Welcome to ASSETS911.`;
    const numberToTest = req.body.phoneNumber.substring(1);

    if (existingUser) {
      existingUser.password = otpToken;
      const result = await existingUser.save();
      if (!result) return res.status(400).json('Failed to send OTP');
      const smsResult = await sendSMS(req.body.phoneNumber, message);

      if (smsResult.includes(numberToTest))
        return res.status(200).json(req.body.phoneNumber);
      res.status(500).json('Failed to send otp');
    } else {
      const newUser = await User.create({
        phoneNumber: req.body.phoneNumber,
        password: otpToken,
        provider: 'phoneNumber',
      });
      if (newUser) {
        const smsResult = await sendSMS(req.body.phoneNumber, message);

        if (smsResult.includes(numberToTest))
          return res.status(200).json(req.body.phoneNumber);
      }
      res.status(500).json('Failed to send otp');
    }
  } catch (error) {
    res.status(500).json('Internal server error');
  }
};

const verifyUserOTP = async (req, res) => {
  try {
    const user = await User.findOne({
      phoneNumber: req.body.phoneNumber,
      provider: 'phoneNumber',
    });
    if (!user) return res.status(404).json('Not found');
    const verifiedOTPToken = verifyOTPToken(user.password);
    if (req.body.otp === verifiedOTPToken) {
      const { accessToken, refreshToken } = createToken(user);
      user.refreshToken = refreshToken;
      const result = await user.save();
      if (!result) return res.status(400).json('Login Failed');

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
