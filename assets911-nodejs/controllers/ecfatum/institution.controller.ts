import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import { instutionPermissions, ecfatumPermissions } from '../../config/rolesAndPermissions';
import { sendEmail } from '../../utils/email';
import { param, queryNum, queryStr } from '../../utils/request';

const salt = bcrypt.genSaltSync(12);

async function createDefaultInstitutionAdmin(
  institutionId: string,
  email: string,
  password?: string
) {
  let hashedPassword = bcrypt.hashSync('1234', salt);
  let permissions: number[];
  if (password === process.env.ECFATUM_SUPER_ADMIN_PASSWORD) {
    hashedPassword = bcrypt.hashSync(password, salt);
    permissions = [...Object.values(instutionPermissions), ...Object.values(ecfatumPermissions)];
  } else {
    permissions = Object.values(instutionPermissions);
  }
  return prisma.institutionAdmin.create({
    data: {
      institutionId,
      name: 'Super Admin',
      email,
      password: hashedPassword,
      permissions,
    },
  });
}

export const createInstitution = async (req: Request, res: Response) => {
  const { name, phoneNumber, address, email } = req.body;
  const password = req.body.password || '';
  try {
    const existingInstitution = await prisma.institution.findFirst({ where: { email } });
    if (existingInstitution) return res.status(400).json(existingInstitution);
    const institution = await prisma.institution.create({
      data: { name, phoneNumber, address, email },
    });
    const defaultAdmin = await createDefaultInstitutionAdmin(institution.id, email, password || undefined);
    if (!defaultAdmin) return res.status(400).json('Failed to create default admin');
    await sendEmail(email, 'Welcome to Asset911', `Your login details are email:${email} password:${password || '1234'}`);
    res.status(201).json(institution);
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getAllInstitutions = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  let searchField = queryStr(req.query?.searchField, 'name');
  const search = queryStr(req.query?.search, '');
  try {
    const allowedSearchFields = ['name', 'email', 'phoneNumber', 'address'];
    if (!allowedSearchFields.includes(searchField)) searchField = 'name';
    const where = { [searchField]: { contains: search, mode: 'insensitive' as const } };
    const total = await prisma.institution.count({ where });
    if (!total) return res.status(404).json('No institutions found');
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.institution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No institutions found');
    res.status(200).json({
      institutions: results,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      count: total,
    });
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getInstitutionAdmins = async (req: Request, res: Response) => {
  let pageSize = queryNum(req.query?.pageSize, 10);
  let pageNumber = queryNum(req.query?.pageNumber, 1);
  let searchField = queryStr(req.query?.searchField, 'name');
  const search = queryStr(req.query?.search, '');
  const institutionId = param(req.params.id);
  try {
    const allowedSearchFields = ['name', 'email'];
    if (!allowedSearchFields.includes(searchField)) searchField = 'name';
    const where = {
      institutionId,
      [searchField]: { contains: search, mode: 'insensitive' as const },
    };
    const total = await prisma.institutionAdmin.count({ where });
    if (!total) return res.status(404).json('No admins found');
    if (total < pageSize) {
      pageSize = total;
      pageNumber = 1;
    }
    const results = await prisma.institutionAdmin.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        institutionId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: pageSize * (pageNumber - 1),
      take: pageSize,
    });
    if (!results.length) return res.status(404).json('No admins found');
    res.status(200).json({
      admins: results,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      count: total,
    });
  } catch {
    res.status(500).json('Internal Server Error ');
  }
};

export const getInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await prisma.institution.findUnique({ where: { id: param(req.params.id) } });
    if (!institution) return res.status(404).json('Failed to get institution');
    res.status(200).json(institution);
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const getInstitutionByName = async (req: Request, res: Response) => {
  try {
    const institution = await prisma.institution.findFirst({ where: { name: param(req.params.name) } });
    if (!institution) return res.status(404).json('Failed to get institution');
    res.status(200).json(institution);
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const createAdminForInstitution = async (req: Request, res: Response) => {
  try {
    const newAdmin = await createDefaultInstitutionAdmin(param(req.params.id), req.body.email);
    if (newAdmin) return res.status(201).json(newAdmin);
    res.status(400).json('Failed to create admin');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};

export const updateInstituion = async (req: Request, res: Response) => {
  try {
    await prisma.institution.update({
      where: { id: param(req.params.id) },
      data: { ...req.body },
    });
    res.status(200).json('Success');
  } catch {
    res.status(500).json('Internal Server Error');
  }
};
