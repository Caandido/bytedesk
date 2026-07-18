-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "gitBranch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "gitTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastCommit" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nextVersion" TEXT NOT NULL DEFAULT '';
