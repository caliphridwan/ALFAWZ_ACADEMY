-- AlterTable
ALTER TABLE "User" ADD COLUMN     "studentNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_studentNumber_key" ON "User"("studentNumber");
