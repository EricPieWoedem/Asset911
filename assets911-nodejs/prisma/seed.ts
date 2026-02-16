import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSeedOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function main() {
  console.log('Starting database seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const generalUserOtp = generateSeedOtp();
  const institutionAdminOtp = generateSeedOtp();
  const ecfatumAdminOtp = generateSeedOtp();
  const policeOtp = generateSeedOtp();

  let user = await prisma.user.findFirst({
    where: { phoneNumber: '0550883056' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        provider: 'phoneNumber',
        phoneNumber: '0550883056',
        seedOtp: generalUserOtp,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { seedOtp: generalUserOtp },
    });
  }

  console.log('Created/Updated user:', user.id);
  console.log(`General User Seed OTP: ${generalUserOtp}`);

  let institution = await prisma.institution.findFirst({
    where: { email: 'test@institution.com' },
  });

  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: 'Test Institution',
        email: 'test@institution.com',
        phoneNumber: '0550123456',
        address: '123 Test Street',
      },
    });
  }

  let institutionAdmin = await prisma.institutionAdmin.findUnique({
    where: { email: 'admin@institution.com' },
  });

  if (!institutionAdmin) {
    institutionAdmin = await prisma.institutionAdmin.create({
      data: {
        name: 'Institution Admin',
        email: 'admin@institution.com',
        password: hashedPassword,
        permissions: [302],
        institutionId: institution.id,
        seedOtp: institutionAdminOtp,
      },
    });
  } else {
    await prisma.institutionAdmin.update({
      where: { id: institutionAdmin.id },
      data: { seedOtp: institutionAdminOtp },
    });
  }

  console.log('Created/Updated institution admin:', institutionAdmin.id);
  console.log(`Institution Admin Seed OTP: ${institutionAdminOtp}`);

  let ecfatumAdmin = await prisma.ecfatumAdmin.findUnique({
    where: { email: 'admin@ecfatum.com' },
  });

  if (!ecfatumAdmin) {
    ecfatumAdmin = await prisma.ecfatumAdmin.create({
      data: {
        name: 'ECFATUM Admin',
        email: 'admin@ecfatum.com',
        password: hashedPassword,
        permissions: [201, 203],
        seedOtp: ecfatumAdminOtp,
      },
    });
  } else {
    await prisma.ecfatumAdmin.update({
      where: { id: ecfatumAdmin.id },
      data: { seedOtp: ecfatumAdminOtp },
    });
  }

  console.log('Created/Updated ECFATUM admin:', ecfatumAdmin.id);
  console.log(`ECFATUM Admin Seed OTP: ${ecfatumAdminOtp}`);

  let officer = await prisma.officer.findUnique({
    where: { email: 'officer@police.com' },
  });

  if (!officer) {
    officer = await prisma.officer.create({
      data: {
        name: 'Police Officer',
        email: 'officer@police.com',
        password: hashedPassword,
        idNumber: 'POL001',
        seedOtp: policeOtp,
      },
    });
  } else {
    await prisma.officer.update({
      where: { id: officer.id },
      data: { seedOtp: policeOtp },
    });
  }

  console.log('Created police officer:', officer.id);
  console.log(`Police Officer Seed OTP: ${policeOtp}`);

  console.log('\n=== Seed OTPs ===');
  console.log(`General User: ${generalUserOtp}`);
  console.log(`Institution Admin: ${institutionAdminOtp}`);
  console.log(`ECFATUM Admin: ${ecfatumAdminOtp}`);
  console.log(`Police Officer: ${policeOtp}`);
  console.log('\nSeeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
