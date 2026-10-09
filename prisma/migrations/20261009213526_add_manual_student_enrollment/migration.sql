-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('PAYSTACK', 'SCHOLARSHIP', 'OFFLINE_PAYMENT');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "source" "EnrollmentSource" NOT NULL DEFAULT 'PAYSTACK';
