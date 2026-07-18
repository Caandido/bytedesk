-- CreateTable
CREATE TABLE "study_sections" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_sections_studyId_idx" ON "study_sections"("studyId");

-- AddForeignKey
ALTER TABLE "study_sections" ADD CONSTRAINT "study_sections_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
