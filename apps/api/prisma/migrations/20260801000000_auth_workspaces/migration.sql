-- Auth + Workspaces (multiusuário/times). Migração NÃO-DESTRUTIVA: os dados
-- existentes são preservados e movidos para um workspace-padrão ("ws_default"),
-- que fica sem dono até ser reivindicado pelo primeiro registro (fluxo de claim).

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "memberships_workspaceId_idx" ON "memberships"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_userId_workspaceId_key" ON "memberships"("userId", "workspaceId");

-- Seed: workspace-padrão (sem dono) que recebe TODOS os dados legados.
INSERT INTO "workspaces" ("id", "name", "ownerId", "createdAt", "updatedAt")
VALUES ('ws_default', 'Meu Workspace', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- workspaceId em cada entidade-raiz: adiciona NULLABLE, faz backfill, depois NOT NULL.
ALTER TABLE "notes" ADD COLUMN "workspaceId" TEXT;
UPDATE "notes" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "notes" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "studies" ADD COLUMN "workspaceId" TEXT;
UPDATE "studies" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "studies" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "projects" ADD COLUMN "workspaceId" TEXT;
UPDATE "projects" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "projects" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "diary_entries" ADD COLUMN "workspaceId" TEXT;
UPDATE "diary_entries" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "diary_entries" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "known_errors" ADD COLUMN "workspaceId" TEXT;
UPDATE "known_errors" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "known_errors" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "wiki_pages" ADD COLUMN "workspaceId" TEXT;
UPDATE "wiki_pages" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "wiki_pages" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "roadmaps" ADD COLUMN "workspaceId" TEXT;
UPDATE "roadmaps" SET "workspaceId" = 'ws_default' WHERE "workspaceId" IS NULL;
ALTER TABLE "roadmaps" ALTER COLUMN "workspaceId" SET NOT NULL;

-- favorites.userId permanece NULLABLE (preenchido no claim do primeiro registro).
ALTER TABLE "favorites" ADD COLUMN "userId" TEXT;

-- DropIndex (unicidade antiga por type+entityId → agora inclui o usuário)
DROP INDEX "favorites_type_entityId_key";

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_type_entityId_key" ON "favorites"("userId", "type", "entityId");

-- CreateIndex
CREATE INDEX "diary_entries_workspaceId_idx" ON "diary_entries"("workspaceId");

-- CreateIndex
CREATE INDEX "known_errors_workspaceId_idx" ON "known_errors"("workspaceId");

-- CreateIndex
CREATE INDEX "notes_workspaceId_idx" ON "notes"("workspaceId");

-- CreateIndex
CREATE INDEX "projects_workspaceId_idx" ON "projects"("workspaceId");

-- CreateIndex
CREATE INDEX "roadmaps_workspaceId_idx" ON "roadmaps"("workspaceId");

-- CreateIndex
CREATE INDEX "studies_workspaceId_idx" ON "studies"("workspaceId");

-- CreateIndex
CREATE INDEX "wiki_pages_workspaceId_idx" ON "wiki_pages"("workspaceId");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studies" ADD CONSTRAINT "studies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "known_errors" ADD CONSTRAINT "known_errors_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
