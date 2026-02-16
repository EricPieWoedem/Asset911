# Assets911 Backend README

## Stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Ensure environment variables are set in `.env`:

   ```env
   DATABASE_URL=postgresql://asset911_user:asset911_password@localhost:5432/asset911_db?schema=public
   PORT=5000
   JWT_SECRET=your-secret-key-here-change-this-in-production
   SMS_API_USERNAME=
   SMS_API_PASSWORD=
   EMAIL_API=
   ```

3. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

4. Run database migrations:

   ```bash
   npm run prisma:migrate
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

## Useful Commands

- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run compiled backend
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed development data

## Project Structure

```
assets911-nodejs/
|-- config/
|-- controllers/
|-- helpers/
|-- prisma/
|-- routes/
|-- types/
|-- utils/
|-- index.ts
|-- package.json
|-- tsconfig.json
```
