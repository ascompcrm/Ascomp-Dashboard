/*
  Warnings:

  - You are about to drop the column `runningHours` on the `projector` table. All the data in the column will be lost.
  - You are about to drop the column `replacementRequired` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `service_record` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "service_record_projectorId_status_idx";

-- DropIndex
DROP INDEX "service_record_status_idx";

-- AlterTable
ALTER TABLE "projector" DROP COLUMN "runningHours",
ADD COLUMN     "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "service_record" DROP COLUMN "replacementRequired",
DROP COLUMN "status",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE INDEX "service_record_projectorId_idx" ON "service_record"("projectorId");
