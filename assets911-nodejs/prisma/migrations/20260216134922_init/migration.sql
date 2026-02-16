-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('google', 'phoneNumber');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('lost', 'sold', 'okay', 'damaged', 'for_sale');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "image" TEXT,
    "provider" "Provider" NOT NULL,
    "phoneNumber" TEXT,
    "ghanaCardNumber" TEXT,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seedOtp" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categoryType" TEXT,
    "uniqueNumber" TEXT NOT NULL,
    "dateOfPurchase" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "purchaseReceipt" TEXT,
    "identificationDetails" TEXT NOT NULL,
    "otherDetails" TEXT,
    "images" TEXT[],
    "registrationAddress" TEXT NOT NULL,
    "presentLocation" TEXT,
    "status" "AssetStatus" NOT NULL,
    "additionalCategoryData" JSONB,
    "ownerId" TEXT NOT NULL,
    "recentTransferRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_records" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT,
    "transferDate" TEXT NOT NULL,
    "notes" TEXT,
    "confirmationCode" TEXT,
    "notAnExistingUser" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "permissions" INTEGER[],
    "refreshToken" TEXT,
    "seedOtp" TEXT,
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_assets" (
    "id" TEXT NOT NULL,
    "model" TEXT,
    "brand" TEXT,
    "type" TEXT NOT NULL,
    "categoryType" TEXT,
    "name" TEXT NOT NULL,
    "uniqueNumber" TEXT,
    "dateOfPurchase" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "purchaseReceipt" TEXT NOT NULL,
    "identificationDetails" TEXT NOT NULL,
    "otherDetails" TEXT,
    "images" TEXT[],
    "registrationAddress" TEXT NOT NULL,
    "assetLocation" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'okay',
    "properties" JSONB,
    "additionalCategoryData" JSONB,
    "ownerId" TEXT NOT NULL,
    "assignedTo" JSONB DEFAULT '{"staffName": ""}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecfatum_admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "permissions" INTEGER[],
    "refreshToken" TEXT,
    "seedOtp" TEXT,
    "institutionId" TEXT NOT NULL DEFAULT 'ecfatum',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecfatum_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "refreshToken" TEXT,
    "seedOtp" TEXT,
    "institutionId" JSONB NOT NULL DEFAULT '{"id": "police"}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryType" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_types" (
    "id" TEXT NOT NULL,
    "categoryType" TEXT NOT NULL,
    "brandsAndModels" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_seedOtp_key" ON "users"("seedOtp");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "assets_uniqueNumber_key" ON "assets"("uniqueNumber");

-- CreateIndex
CREATE INDEX "assets_ownerId_idx" ON "assets"("ownerId");

-- CreateIndex
CREATE INDEX "assets_uniqueNumber_idx" ON "assets"("uniqueNumber");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE INDEX "transfer_records_assetId_idx" ON "transfer_records"("assetId");

-- CreateIndex
CREATE INDEX "transfer_records_fromId_idx" ON "transfer_records"("fromId");

-- CreateIndex
CREATE INDEX "transfer_records_toId_idx" ON "transfer_records"("toId");

-- CreateIndex
CREATE INDEX "transfer_records_status_idx" ON "transfer_records"("status");

-- CreateIndex
CREATE INDEX "institutions_email_idx" ON "institutions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "institution_admins_email_key" ON "institution_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "institution_admins_seedOtp_key" ON "institution_admins"("seedOtp");

-- CreateIndex
CREATE INDEX "institution_admins_email_idx" ON "institution_admins"("email");

-- CreateIndex
CREATE INDEX "institution_admins_institutionId_idx" ON "institution_admins"("institutionId");

-- CreateIndex
CREATE INDEX "institution_assets_ownerId_idx" ON "institution_assets"("ownerId");

-- CreateIndex
CREATE INDEX "institution_assets_status_idx" ON "institution_assets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ecfatum_admins_email_key" ON "ecfatum_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ecfatum_admins_seedOtp_key" ON "ecfatum_admins"("seedOtp");

-- CreateIndex
CREATE INDEX "ecfatum_admins_email_idx" ON "ecfatum_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "officers_email_key" ON "officers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "officers_seedOtp_key" ON "officers"("seedOtp");

-- CreateIndex
CREATE INDEX "officers_email_idx" ON "officers"("email");

-- CreateIndex
CREATE INDEX "brands_type_idx" ON "brands"("type");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "asset_types_categoryType_key" ON "asset_types"("categoryType");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_recentTransferRecordId_fkey" FOREIGN KEY ("recentTransferRecordId") REFERENCES "transfer_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_records" ADD CONSTRAINT "transfer_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_records" ADD CONSTRAINT "transfer_records_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_records" ADD CONSTRAINT "transfer_records_toId_fkey" FOREIGN KEY ("toId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_admins" ADD CONSTRAINT "institution_admins_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_assets" ADD CONSTRAINT "institution_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
