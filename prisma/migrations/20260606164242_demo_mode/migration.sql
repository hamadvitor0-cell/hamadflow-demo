-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'EM_ANALISE', 'CONTATADO', 'CONVERTIDO', 'RECUSADO', 'ARQUIVADO');

-- AlterEnum
ALTER TYPE "AiGenerationStatus" ADD VALUE 'FALLBACK';

-- AlterEnum
ALTER TYPE "AiGenerationType" ADD VALUE 'PORTFOLIO_REQUEST';

-- AlterTable
ALTER TABLE "AiGenerationLog" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'mock';

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isCompany" BOOLEAN NOT NULL DEFAULT false,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "projectName" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "budgetRange" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'demo',
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "convertedClientId" TEXT,
    "convertedBriefingId" TEXT,
    "convertedProposalId" TEXT,
    "convertedProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_convertedClientId_idx" ON "Lead"("convertedClientId");

-- CreateIndex
CREATE INDEX "Lead_convertedBriefingId_idx" ON "Lead"("convertedBriefingId");

-- CreateIndex
CREATE INDEX "Lead_convertedProposalId_idx" ON "Lead"("convertedProposalId");

-- CreateIndex
CREATE INDEX "Lead_convertedProjectId_idx" ON "Lead"("convertedProjectId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedClientId_fkey" FOREIGN KEY ("convertedClientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedBriefingId_fkey" FOREIGN KEY ("convertedBriefingId") REFERENCES "Briefing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedProposalId_fkey" FOREIGN KEY ("convertedProposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_convertedProjectId_fkey" FOREIGN KEY ("convertedProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
