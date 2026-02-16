const { sign, verify } = require('jsonwebtoken');

const generateOTP = length => {
  const characters = '0123456789';
  let OTP = '';

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    OTP += characters[index];
  }
  return OTP;
};

const createOTPToken = otp => {
  const token = sign({ otp }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
  return token;
};

const verifyOTPToken = token => {
  const valid = verify(token, process.env.JWT_SECRET);
  if (valid) {
    return valid.otp;
  } else {
    return null;
  }
};

const createTransferToken = otp => {
  const token = sign({ otp }, process.env.JWT_SECRET, {
    expiresIn: '60m',
  });
  return token;
};

const verifyTransferToken = token => {
  const valid = verify(token, process.env.JWT_SECRET);
  if (valid) {
    return valid.otp;
  } else {
    return null;
  }
};
module.exports = {
  createOTPToken,
  verifyOTPToken,
  generateOTP,
  createTransferToken,
  verifyTransferToken,
};
