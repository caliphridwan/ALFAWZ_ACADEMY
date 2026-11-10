-- CreateTable
CREATE TABLE "SponsorImpact" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "supportedOverride" INTEGER,
    "completedOverride" INTEGER,
    "certificatesOverride" INTEGER,
    "attendanceOverride" INTEGER,
    "recitationOverride" DOUBLE PRECISION,
    "passRateOverride" INTEGER,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorImpact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SponsorImpact_sponsorId_key" ON "SponsorImpact"("sponsorId");

-- AddForeignKey
ALTER TABLE "SponsorImpact" ADD CONSTRAINT "SponsorImpact_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
