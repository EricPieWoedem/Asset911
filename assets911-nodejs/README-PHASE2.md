# Phase 2: Database Migration Preparation - Setup Guide

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed

## Setup Steps

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL container
npm run db:start

# Or using docker-compose directly
docker-compose up -d
```

The database will be available at:
- Host: `localhost`
- Port: `5432`
- Database: `asset911_db`
- User: `asset911_user`
- Password: `asset911_password`

### 2. Run Database Migrations

```bash
# Create and apply migrations
npm run prisma:migrate

# This will:
# - Create migration files
# - Apply schema to database
# - Generate Prisma Client
```

### 3. Seed Database with Test Data

```bash
# Seed database with test users and seed OTPs
npm run prisma:seed
```

This will create:
- General User (with seed OTP)
- Institution Admin (with seed OTP)
- ECFATUM Admin (with seed OTP)
- Police Officer (with seed OTP)

**Note**: The seed OTPs will be displayed in the console. Save them for testing login.

### 4. View Database (Optional)

```bash
# Open Prisma Studio to view/edit data
npm run prisma:studio
```

## Database Management Commands

```bash
# Start database
npm run db:start

# Stop database
npm run db:stop

# Reset database (removes all data)
npm run db:reset

# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

## Seed OTPs for Testing

After running `npm run prisma:seed`, you'll receive OTPs for each user type:

- **General User**: Use phone number `0550883056` and the displayed OTP
- **Institution Admin**: Use email `admin@institution.com` and the displayed OTP
- **ECFATUM Admin**: Use email `admin@ecfatum.com` and the displayed OTP
- **Police Officer**: Use email `officer@police.com` and the displayed OTP

## Connection String

The connection string is configured in `.env`:

```
DATABASE_URL="postgresql://asset911_user:asset911_password@localhost:5432/asset911_db?schema=public"
```

## Troubleshooting

### Database won't start
- Ensure Docker Desktop is running
- Check if port 5432 is already in use
- Try: `docker-compose down` then `docker-compose up -d`

### Migration errors
- Ensure database is running: `npm run db:start`
- Check DATABASE_URL in `.env` file
- Try resetting: `npm run db:reset` then `npm run prisma:migrate`

### Prisma Client errors
- Regenerate client: `npm run prisma:generate`
- Ensure schema.prisma is valid
