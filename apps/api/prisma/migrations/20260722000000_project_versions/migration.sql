-- CreateTable
CREATE TABLE "project_versions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "releasedAt" TIMESTAMP(3),
    "features" TEXT NOT NULL DEFAULT '',
    "fixes" TEXT NOT NULL DEFAULT '',
    "improvements" TEXT NOT NULL DEFAULT '',
    "breaking" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_versions_projectId_idx" ON "project_versions"("projectId");

-- AddForeignKey
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
