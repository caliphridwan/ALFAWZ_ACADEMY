-- AlterTable
ALTER TABLE "User" ADD COLUMN "referralCodeId" TEXT;

-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ownerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_ownerId_key" ON "ReferralCode"("ownerId");

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
