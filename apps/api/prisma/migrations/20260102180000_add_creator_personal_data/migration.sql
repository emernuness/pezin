-- AlterTable
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
ALTER TABLE "User" ADD COLUMN "cpf" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "addressZipCode" TEXT;
ALTER TABLE "User" ADD COLUMN "addressStreet" TEXT;
ALTER TABLE "User" ADD COLUMN "addressNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "addressComplement" TEXT;
ALTER TABLE "User" ADD COLUMN "addressNeighborhood" TEXT;
ALTER TABLE "User" ADD COLUMN "addressCity" TEXT;
ALTER TABLE "User" ADD COLUMN "addressState" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "User_cpf_idx" ON "User"("cpf");
