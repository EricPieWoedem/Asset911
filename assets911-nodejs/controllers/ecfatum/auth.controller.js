const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const { ecfatumPermissions } = require('../../config/rolesAndPermissions');
const { createTokenWithPermissions } = require('../../config/jwt');
const { sendRefreshToken } = require('../../helpers/authHelpers');

const salt = bcrypt.genSaltSync(10);

const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const superAdmin = await prisma.ecfatumAdmin.findUnique({ where: { email } });
    if (!superAdmin) {
      const hashedPassword = bcrypt.hashSync(password, salt);
      const newSuperAdmin = await prisma.ecfatumAdmin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          institutionId: 'ecfatum',
          permissions: Object.values(ecfatumPermissions),
        },
      });
      if (newSuperAdmin) return res.status(201).json('Admin created');
      res.status(400).json('Admin not created');
    } else {
      return res.status(400).json('Admin already exists');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const superAdmin = await prisma.ecfatumAdmin.findUnique({ where: { email } });
    if (superAdmin) {
      const isOtpValid = otp && superAdmin.seedOtp && otp === superAdmin.seedOtp;
      const isPasswordValid = password
        ? bcrypt.compareSync(password, superAdmin.password)
        : false;
      if (isPasswordValid || isOtpValid) {
        const { accessToken, refreshToken } =
          createTokenWithPermissions(superAdmin);
        sendRefreshToken(res, refreshToken);
        await prisma.ecfatumAdmin.update({
          where: { id: superAdmin.id },
          data: { refreshToken },
        });
        return res.status(200).json({ accessToken });
      }
      return res.status(400).json('Invalid credentials');
    }
    return res.status(400).json('Invalid credentials');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = { createSuperAdmin, loginSuperAdmin };
