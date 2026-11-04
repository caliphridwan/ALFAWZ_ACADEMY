-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TEACHER';

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "RecitationTask" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecitationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecitationSubmission" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "durationSec" INTEGER,
    "note" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    "feedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "RecitationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE INDEX "RecitationTask_courseId_createdAt_idx" ON "RecitationTask"("courseId", "createdAt");

-- CreateIndex
CREATE INDEX "RecitationSubmission_taskId_reviewedAt_idx" ON "RecitationSubmission"("taskId", "reviewedAt");

-- CreateIndex
CREATE INDEX "RecitationSubmission_studentId_idx" ON "RecitationSubmission"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "RecitationSubmission_taskId_studentId_key" ON "RecitationSubmission"("taskId", "studentId");

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationTask" ADD CONSTRAINT "RecitationTask_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationSubmission" ADD CONSTRAINT "RecitationSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "RecitationTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecitationSubmission" ADD CONSTRAINT "RecitationSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
