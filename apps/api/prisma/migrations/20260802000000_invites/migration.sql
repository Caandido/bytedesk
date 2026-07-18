-- Convites de workspace (Fase 2 — times). Aditivo: nova tabela `invites`.

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_workspaceId_idx" ON "invites"("workspaceId");

-- CreateIndex
CREATE INDEX "invites_token_idx" ON "invites"("token");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
