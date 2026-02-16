const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const { createTokenWithPermissions } = require('../../config/jwt');
const { sendRefreshToken } = require('../../helpers/authHelpers');

const salt = bcrypt.genSaltSync(12);

const createAdmin = async (req, res) => {
  const { name, email, permissions, password } = req.body;
  try {
    const exisitingAdmin = await prisma.institutionAdmin.findFirst({
      where: {
        email,
        institutionId: req.institutionId,
      },
    });
    if (exisitingAdmin) return res.status(400).json(exisitingAdmin);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newAdmin = await prisma.institutionAdmin.create({
      data: {
        name,
        permissions,
        email,
        password: hashedPassword,
        institutionId: req.institutionId,
      },
    });
    if (!newAdmin) return res.status(400).json('Failed to create Admin');
    res.status(201).json('Admin created');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const login = async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    const admin = await prisma.institutionAdmin.findUnique({
      where: { email },
      include: { institution: true },
    });
    if (!admin) return res.status(400).json('Invalid Credentials');

    const isOtpValid = otp && admin.seedOtp && otp === admin.seedOtp;
    const isPasswordValid = password
      ? bcrypt.compareSync(password, admin.password)
      : false;

    if (isPasswordValid || isOtpValid) {
      const adminProfile = {
        name: admin.name,
        email: admin.email,
      };

      const tokenPayload = {
        ...admin,
        institutionId: admin.institution || admin.institutionId,
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
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = { createAdmin, login };
