-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "recordingUrl" TEXT;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipients" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Announcement_createdAt_idx" ON "Announcement"("createdAt");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
