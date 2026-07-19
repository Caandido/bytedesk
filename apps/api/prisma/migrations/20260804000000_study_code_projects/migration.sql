-- Código e projetos dentro do estudo. Aditivo: tabela study_code_files + join n-n.

-- CreateTable
CREATE TABLE "study_code_files" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_code_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToStudy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectToStudy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "study_code_files_studyId_idx" ON "study_code_files"("studyId");

-- CreateIndex
CREATE INDEX "_ProjectToStudy_B_index" ON "_ProjectToStudy"("B");

-- AddForeignKey
ALTER TABLE "study_code_files" ADD CONSTRAINT "study_code_files_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToStudy" ADD CONSTRAINT "_ProjectToStudy_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToStudy" ADD CONSTRAINT "_ProjectToStudy_B_fkey" FOREIGN KEY ("B") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
