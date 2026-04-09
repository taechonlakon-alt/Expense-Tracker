-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_name_phone_key" ON "Customer"("name", "phone");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- AlterTable
ALTER TABLE "Debt" ADD COLUMN "customerId" INTEGER;

-- Seed customers from existing debts
INSERT INTO "Customer" ("name", "phone", "createdAt", "updatedAt")
SELECT DISTINCT "customerName", "customerPhone", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Debt";

-- Link debts to customers
UPDATE "Debt" AS d
SET "customerId" = c."id"
FROM "Customer" AS c
WHERE d."customerName" = c."name"
  AND d."customerPhone" = c."phone";

-- Finalize customer relation
ALTER TABLE "Debt" ALTER COLUMN "customerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Debt_customerId_status_debtDate_idx" ON "Debt"("customerId", "status", "debtDate" DESC);

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
