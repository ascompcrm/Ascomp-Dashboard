/*
  Warnings:

  - You are about to drop the column `nextServiceAt` on the `projector` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectorModel]` on the table `projector` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "projector_serialNo_key";

-- DropIndex
DROP INDEX "site_address_key";

-- AlterTable
ALTER TABLE "projector" DROP COLUMN "nextServiceAt";

-- CreateIndex
CREATE UNIQUE INDEX "projector_projectorModel_key" ON "projector"("projectorModel");
