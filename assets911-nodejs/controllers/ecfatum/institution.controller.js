//This controller is responsible for managing institutions by Ecfatum
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Institution = require('../../models/institutions/institution.model');
const InstitutionAdmin = require('../../models/institutions/admin.model');
const {
  instutionPermissions,
  ecfatumPermissions,
} = require('../../config/rolesAndPermissions');
const { sendEmail } = require('../../utils/email');

const salt = bcrypt.genSaltSync(12);

const createDefaultInstitutionAdmin = async (
  institutionId,
  email,
  password
) => {
  let hashedPassword = bcrypt.hashSync('1234', salt);
  let permissions;
  if (password === process.env.ECFATUM_SUPER_ADMIN_PASSWORD) {
    hashedPassword = bcrypt.hashSync(password, salt);
    permissions = [
      ...Object.values(instutionPermissions),
      ...Object.values(ecfatumPermissions),
    ];
  } else {
    permissions = Object.values(instutionPermissions);
  }
  const admin = await InstitutionAdmin.create({
    institutionId,
    name: 'Super Admin',
    email,
    password: hashedPassword,
    permissions,
  });
  return admin;
};

const createInstitution = async (req, res) => {
  const { name, phoneNumber, address, email } = req.body;
  const password = req.body.password || '';
  try {
    const existingInstitution = await Institution.findOne({ email });
    if (existingInstitution) return res.status(400).json(existingInstitution);
    const institution = await Institution.create({
      name,
      phoneNumber,
      address,
      email,
    });
    const defaultAdmin = await createDefaultInstitutionAdmin(
      institution.id,
      email,
      password
    );

    if (!defaultAdmin)
      return res.status(400).json('Failed to create default admin');
    if (!institution)
      return res.status(400).json('Failed to create institution');
    await sendEmail(
      email,
      'Welcome to Asset911',
      `Your login details are email:${email} password:${password || '1234'}`
    );
    res.status(201).json(institution);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getAllInstitutions = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let searchField = req.query?.searchField || 'name';
  let search = req.query?.search || '';
  try {
    const countPipeline = [
      {
        $match: {
          [searchField]: { $regex: new RegExp(search, 'i') },
        },
      },
      {
        $count: 'total',
      },
    ];
    const countResult = await Institution.aggregate(countPipeline);
    if (!countResult[0]) {
      return res.status(404).json('No institutions found');
    }
    const total = countResult[0].total;
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          [searchField]: { $regex: new RegExp(search, 'i') },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];
    const results = await Institution.aggregate(retrievalPipeline);
    if (!results[0]) return res.status(404).json('No institutions found');

    const totalPages = Math.ceil(total / pageSize);
    res.status(200).json({
      institutions: results,
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getInstitutionAdmins = async (req, res) => {
  let pageSize = req.query?.pageSize * 1 || 10;
  let pageNumber = req.query?.pageNumber * 1 || 1;
  let searchField = req.query?.searchField || 'fullName';
  let search = req.query?.search || '';
  const institutionId = new mongoose.Types.ObjectId(req.params.id);
  try {
    const countPipeline = [
      {
        $match: {
          institutionId,
          [searchField]: { $regex: new RegExp(search, 'i') },
        },
      },
      { $count: 'total' },
    ];
    const countResult = await InstitutionAdmin.aggregate(countPipeline);
    if (!countResult[0]) return res.status(404).json('No admins found');
    const total = countResult[0].total;

    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }

    const retrievalPipeline = [
      {
        $match: {
          institutionId,
          [searchField]: { $regex: new RegExp(search, 'i') },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pageSize * (pageNumber - 1) },
      { $limit: pageSize },
    ];

    const results = await InstitutionAdmin.aggregate(retrievalPipeline);
    if (!results[0]) {
      return res.status(404).json('No admins found');
    }

    const totalPages = Math.ceil(total / pageSize);
    res.status(200).json({
      admins: results,
      totalPages,
      currentPage: pageNumber,
      count: total,
    });
  } catch (error) {
    res.status(500).json('Internal Server Error ');
  }
};

const getInstitution = async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json('Failed to get institution');
    res.status(200).json(institution);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const getInstitutionByName = async (req, res) => {
  try {
    const institution = await Institution.findOne({ name: req.params.name });
    if (!institution) return res.status(404).json('Failed to get institution');
    res.status(200).json(institution);
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const createAdminForInstitution = async (req, res) => {
  try {
    const newAdmin = await createDefaultInstitutionAdmin(
      req.params.id,
      req.body.email
    );
    if (newAdmin) return res.status(201).json(newAdmin);
    res.status(400).json('Failed to create admin');
  } catch (error) {
    res.status(500).json('Internal Server Error');
  }
};

const updateInstituion = async (req, res) => {
  try {
    const updatedInstitution = await Institution.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      }
    );
    if (updatedInstitution) return res.status(200).json('Success');
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
};

module.exports = {
  createInstitution,
  getAllInstitutions,
  getInstitution,
  getInstitutionAdmins,
  getInstitutionByName,
  createAdminForInstitution,
  updateInstituion,
};
