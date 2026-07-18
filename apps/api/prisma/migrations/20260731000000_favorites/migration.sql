-- CreateEnum
CREATE TYPE "FavoriteType" AS ENUM ('STUDY', 'PROJECT', 'ROADMAP', 'WIKI', 'ERROR');

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "type" "FavoriteType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_type_entityId_key" ON "favorites"("type", "entityId");

