-- CreateEnum
CREATE TYPE "AlumniStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Alumnus" ADD COLUMN     "consentToDisplay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "selfSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "AlumniStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE INDEX "Alumnus_status_idx" ON "Alumnus"("status");
