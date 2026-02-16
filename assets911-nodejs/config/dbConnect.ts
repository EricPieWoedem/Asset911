import prisma from '../prisma/client';

async function dbConnect() {
  try {
    await prisma.$connect();
    console.log('Database Connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

export default dbConnect;
