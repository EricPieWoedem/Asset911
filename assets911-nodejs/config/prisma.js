const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

let prisma;

if (global.__ASSET911_PRISMA__) {
  prisma = global.__ASSET911_PRISMA__;
} else {
  prisma = new PrismaClient({ adapter });
  global.__ASSET911_PRISMA__ = prisma;
}

module.exports = prisma;
