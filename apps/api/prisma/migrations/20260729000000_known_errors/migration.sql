-- CreateTable
CREATE TABLE "known_errors" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cause" TEXT NOT NULL DEFAULT '',
    "solution" TEXT NOT NULL DEFAULT '',
    "technology" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "known_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "known_errors_category_idx" ON "known_errors"("category");

