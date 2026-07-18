-- CreateEnum
CREATE TYPE "IdeaRating" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('NEW', 'CONSIDERING', 'PLANNED', 'DONE', 'DISCARDED');

-- CreateTable
CREATE TABLE "ideas" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priority" "IdeaRating" NOT NULL DEFAULT 'MEDIUM',
    "impact" "IdeaRating" NOT NULL DEFAULT 'MEDIUM',
    "complexity" "IdeaRating" NOT NULL DEFAULT 'MEDIUM',
    "status" "IdeaStatus" NOT NULL DEFAULT 'NEW',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ideas_projectId_idx" ON "ideas"("projectId");

-- AddForeignKey
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
