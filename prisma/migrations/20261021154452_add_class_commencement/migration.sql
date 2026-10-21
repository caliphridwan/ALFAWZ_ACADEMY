-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "classStartsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "commencementNotifiedAt" TIMESTAMP(3);
