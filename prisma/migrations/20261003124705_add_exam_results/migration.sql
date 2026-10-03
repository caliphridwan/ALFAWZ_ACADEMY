-- CreateEnum
CREATE TYPE "ExamResult" AS ENUM ('PASSED', 'FAILED');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "examResult" "ExamResult",
ADD COLUMN     "examResultSeen" BOOLEAN NOT NULL DEFAULT false;
