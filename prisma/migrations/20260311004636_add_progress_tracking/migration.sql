-- CreateTable
CREATE TABLE "drill_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "modId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drill_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_last_position" (
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "modId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_last_position_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "drill_progress_userId_idx" ON "drill_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "drill_progress_userId_drillId_key" ON "drill_progress"("userId", "drillId");

-- AddForeignKey
ALTER TABLE "drill_progress" ADD CONSTRAINT "drill_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_last_position" ADD CONSTRAINT "user_last_position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
