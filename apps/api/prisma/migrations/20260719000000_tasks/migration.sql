-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'TESTING', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "TaskStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignee" TEXT NOT NULL DEFAULT '',
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spentHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_projectId_idx" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "tasks_projectId_status_idx" ON "tasks"("projectId", "status");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
