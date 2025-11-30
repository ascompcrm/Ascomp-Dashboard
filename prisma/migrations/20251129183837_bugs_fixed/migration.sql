/*
  Warnings:

  - You are about to drop the column `projectorModel` on the `projector` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNo]` on the table `projector` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `modelNo` to the `projector` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "projector_projectorModel_key";

-- AlterTable
ALTER TABLE "projector" DROP COLUMN "projectorModel",
ADD COLUMN     "modelNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "service_record" ADD COLUMN     "BW_Step_10_2Kfl" TEXT,
ADD COLUMN     "BW_Step_10_2Kx" TEXT,
ADD COLUMN     "BW_Step_10_2Ky" TEXT,
ADD COLUMN     "BW_Step_10_4Kfl" TEXT,
ADD COLUMN     "BW_Step_10_4Kx" TEXT,
ADD COLUMN     "BW_Step_10_4Ky" TEXT,
ADD COLUMN     "photosDriveLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "projector_serialNo_key" ON "projector"("serialNo");
