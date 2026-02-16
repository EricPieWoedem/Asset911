-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "lastSeenLocation" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not found',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignment_history" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "assginedOn" TEXT NOT NULL,
    "unAssignedOn" TEXT,
    "institutionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_assetId_idx" ON "reports"("assetId");

-- CreateIndex
CREATE INDEX "asset_assignment_history_assetId_idx" ON "asset_assignment_history"("assetId");

-- CreateIndex
CREATE INDEX "asset_assignment_history_institutionId_idx" ON "asset_assignment_history"("institutionId");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignment_history" ADD CONSTRAINT "asset_assignment_history_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "institution_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignment_history" ADD CONSTRAINT "asset_assignment_history_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
