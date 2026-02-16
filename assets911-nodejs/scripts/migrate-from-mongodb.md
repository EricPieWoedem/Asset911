# MongoDB to PostgreSQL Migration Guide

This guide explains how to migrate data from MongoDB to PostgreSQL.

## Prerequisites

1. MongoDB database running and accessible
2. PostgreSQL database running (via Docker)
3. Both databases have been backed up

## Migration Steps

### Step 1: Export MongoDB Data

```bash
# Export users
mongoexport --uri="<MONGO_URL>" --collection=users --out=users.json --jsonArray

# Export assets
mongoexport --uri="<MONGO_URL>" --collection=assets --out=assets.json --jsonArray

# Export transfer records
mongoexport --uri="<MONGO_URL>" --collection=transferrecords --out=transfers.json --jsonArray

# Export institutions
mongoexport --uri="<MONGO_URL>" --collection=institutions --out=institutions.json --jsonArray

# Export admins
mongoexport --uri="<MONGO_URL>" --collection=admins --out=institution_admins.json --jsonArray

# Export ECFATUM admins
mongoexport --uri="<MONGO_URL>" --collection=ecfatumadmins --out=ecfatum_admins.json --jsonArray

# Export officers
mongoexport --uri="<MONGO_URL>" --collection=officers --out=officers.json --jsonArray

# Export brands
mongoexport --uri="<MONGO_URL>" --collection=brands --out=brands.json --jsonArray

# Export categories
mongoexport --uri="<MONGO_URL>" --collection=categories --out=categories.json --jsonArray

# Export asset types
mongoexport --uri="<MONGO_URL>" --collection=brandandsmodelss --out=asset_types.json --jsonArray
```

### Step 2: Transform and Import Data

A migration script will be created to:
1. Read JSON files
2. Transform MongoDB ObjectIds to UUIDs
3. Map relationships
4. Import into PostgreSQL using Prisma

### Step 3: Validate Data

After migration:
1. Check record counts match
2. Verify relationships
3. Test application functionality

## Notes

- ObjectIds will be converted to UUIDs
- Timestamps will be preserved
- Relationships will be maintained through foreign keys
- Seed OTPs will be generated for existing users
