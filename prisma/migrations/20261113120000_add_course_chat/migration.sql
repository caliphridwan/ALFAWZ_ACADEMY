-- Course group chat: messages and per-person read/mute state. Additive only.
CREATE TABLE "CourseMessage" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT,
    "audioUrl" TEXT,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CourseMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseChatMember" (
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "muted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CourseChatMember_pkey" PRIMARY KEY ("courseId","userId")
);

CREATE INDEX "CourseMessage_courseId_createdAt_idx" ON "CourseMessage"("courseId", "createdAt");
CREATE INDEX "CourseChatMember_userId_idx" ON "CourseChatMember"("userId");

ALTER TABLE "CourseMessage" ADD CONSTRAINT "CourseMessage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseMessage" ADD CONSTRAINT "CourseMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseChatMember" ADD CONSTRAINT "CourseChatMember_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseChatMember" ADD CONSTRAINT "CourseChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
