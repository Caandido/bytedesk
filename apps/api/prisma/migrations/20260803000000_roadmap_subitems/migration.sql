-- Sub-itens de roadmap (aninhamento de 1 nível). Aditivo: coluna auto-relacional.

-- AlterTable
ALTER TABLE "roadmap_items" ADD COLUMN "parentId" TEXT;

-- CreateIndex
CREATE INDEX "roadmap_items_parentId_idx" ON "roadmap_items"("parentId");

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "roadmap_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
