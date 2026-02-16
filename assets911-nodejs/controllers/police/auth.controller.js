const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const genSalt = bcrypt.genSaltSync(10);
const { createTokenWithPermissions } = require('../../config/jwt');
const { sendRefreshToken } = require('../../helpers/authHelpers');

const registerOfficer = async (req, res) => {
  try {
    const existingOfficer = await prisma.officer.findUnique({
      where: { email: req.body.email },
    });
    if (existingOfficer) {
      return res.status(409).json('Officer already exists');
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, genSalt);
    const officer = await prisma.officer.create({
      data: {
        ...req.body,
        password: hashedPassword,
      },
    });
    if (officer) {
      return res.status(200).json('Officer created successfully');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

const loginOfficer = async (req, res) => {
  try {
    const officer = await prisma.officer.findUnique({
      where: { email: req.body.email },
    });
    if (!officer) {
      return res.status(404).json('Officer not found');
    }

    const isOtpValid =
      req.body.otp && officer.seedOtp && req.body.otp === officer.seedOtp;
    const isPasswordValid = req.body.password
      ? bcrypt.compareSync(req.body.password, officer.password)
      : false;
    if (!isPasswordValid && !isOtpValid) {
      return res.status(401).json('Invalid password');
    }

    const { accessToken, refreshToken } = createTokenWithPermissions(officer);

    sendRefreshToken(res, refreshToken);

    await prisma.officer.update({
      where: { id: officer.id },
      data: { refreshToken },
    });

    const userProfile = {
      name: officer.name,
      email: officer.email,
      instututionName: officer.institutionId,
      institutionId: officer.institutionId,
    };

    res.status(200).json({ accessToken, userProfile });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { registerOfficer, loginOfficer };
