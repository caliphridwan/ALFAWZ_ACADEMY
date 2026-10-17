-- AlterTable
ALTER TABLE "User" ADD COLUMN     "enrollmentReminderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "enrollmentReminderSentAt" TIMESTAMP(3);
