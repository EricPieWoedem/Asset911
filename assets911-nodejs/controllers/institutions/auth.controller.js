const Admin = require('../../models/institutions/admin.model');
const bcrypt = require('bcryptjs');
const { createTokenWithPermissions } = require('../../config/jwt');

const salt = bcrypt.genSaltSync(12);

const createAdmin = async (req, res) => {
  const { name, email, permissions, password } = req.body;
  try {
    const exisitingAdmin = await Admin.findOne({
      email,
      institutionId: req.institutionId,
    });
    if (exisitingAdmin) return res.status(400).json(exisitingAdmin);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newAdmin = await Admin.create({
      name,
      permissions,
      email,
      password: hashedPassword,
      institutionId: req.institutionId,
    });
    if (!newAdmin) return res.status(400).json('Failed to create Admin');
    res.status(201).json('Admin created');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({
      email,
    })
      .populate('institutionId')
      .exec();
    if (!admin) return res.status(400).json('Invalid Credentials');

    const isPasswordValid = bcrypt.compareSync(password, admin.password);

    if (isPasswordValid) {
      const adminProfile = {
        name: admin.fullName,
        email: admin.email,
      };

      const { accessToken, refreshToken } = createTokenWithPermissions(admin);

      res.cookie('jrft', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });
      admin.refreshToken = refreshToken;
      const refreshTokenSaved = await admin.save();

      if (!refreshTokenSaved)
        return res.status(400).json('Failed to save refresh token');
      res.status(200).json({ accessToken, adminProfile });
    } else {
      res.status(400).json('Invalid Credentials');
    }
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

module.exports = { createAdmin, login };
