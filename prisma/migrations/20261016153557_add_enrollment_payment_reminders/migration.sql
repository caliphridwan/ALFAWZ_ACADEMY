-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "reminderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reminderSentAt" TIMESTAMP(3);
