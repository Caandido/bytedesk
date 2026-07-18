-- CreateTable
CREATE TABLE "project_architectures" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "folderStructure" TEXT NOT NULL DEFAULT '',
    "dependencies" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_architectures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_architectures_projectId_key" ON "project_architectures"("projectId");

-- AddForeignKey
ALTER TABLE "project_architectures" ADD CONSTRAINT "project_architectures_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

