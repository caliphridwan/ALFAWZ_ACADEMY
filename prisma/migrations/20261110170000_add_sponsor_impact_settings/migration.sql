-- CreateTable
CREATE TABLE "SponsorImpactSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "supportedOverride" INTEGER,
    "completedOverride" INTEGER,
    "certificatesOverride" INTEGER,
    "attendanceOverride" INTEGER,
    "recitationOverride" DOUBLE PRECISION,
    "passRateOverride" INTEGER,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SponsorImpactSettings_pkey" PRIMARY KEY ("id")
);
