//Auth controller for Ecfatum users

const EcfatumAdmin = require('../../models/ecfatum/admin.model');
const bcrypt = require('bcryptjs');
const { ecfatumPermissions } = require('../../config/rolesAndPermissions');
const { createTokenWithPermissions } = require('../../config/jwt');

const salt = bcrypt.genSaltSync(10);

const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const superAdmin = await EcfatumAdmin.findOne({ email });
    if (!superAdmin) {
      const hashedPassword = bcrypt.hashSync(password, salt);
      const newSuperAdmin = await EcfatumAdmin.create({
        name,
        email,
        password: hashedPassword,
        institutionId: 'ecfatum',
        permissions: Object.values(ecfatumPermissions),
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
    const { email, password } = req.body;
    const superAdmin = await EcfatumAdmin.findOne({ email });
    if (superAdmin) {
      const isPasswordValid = bcrypt.compareSync(password, superAdmin.password);
      if (isPasswordValid) {
        const { accessToken, refreshToken } =
          createTokenWithPermissions(superAdmin);
        res.cookie('jrft', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
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
