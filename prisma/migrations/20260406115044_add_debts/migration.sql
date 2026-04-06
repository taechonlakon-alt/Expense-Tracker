-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('UNPAID', 'PAID');

-- CreateTable
CREATE TABLE "Debt" (
    "id" SERIAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "debtDate" TIMESTAMP(3) NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debt_status_debtDate_idx" ON "Debt"("status", "debtDate" DESC);

-- CreateIndex
CREATE INDEX "Debt_customerName_idx" ON "Debt"("customerName");

-- CreateIndex
CREATE INDEX "Debt_customerPhone_idx" ON "Debt"("customerPhone");
