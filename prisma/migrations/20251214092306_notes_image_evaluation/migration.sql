/*
  Warnings:

  - You are about to drop the column `channelsCheckedOk` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `convergenceOk` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `screenCroppingOk` on the `service_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "service_record" DROP COLUMN "channelsCheckedOk",
DROP COLUMN "convergenceOk",
DROP COLUMN "screenCroppingOk",
ADD COLUMN     "channelsChecked" TEXT,
ADD COLUMN     "channelsCheckedNote" TEXT,
ADD COLUMN     "convergence" TEXT,
ADD COLUMN     "convergenceNote" TEXT,
ADD COLUMN     "focusBoresightNote" TEXT,
ADD COLUMN     "imageVibrationNote" TEXT,
ADD COLUMN     "integratorPositionNote" TEXT,
ADD COLUMN     "leStatusNote" TEXT,
ADD COLUMN     "litelocNote" TEXT,
ADD COLUMN     "pixelDefectsNote" TEXT,
ADD COLUMN     "screenCropping" TEXT,
ADD COLUMN     "screenCroppingNote" TEXT,
ADD COLUMN     "spotsOnScreenNote" TEXT,
ALTER COLUMN "focusBoresight" DROP NOT NULL,
ALTER COLUMN "focusBoresight" DROP DEFAULT,
ALTER COLUMN "focusBoresight" SET DATA TYPE TEXT,
ALTER COLUMN "integratorPosition" DROP NOT NULL,
ALTER COLUMN "integratorPosition" DROP DEFAULT,
ALTER COLUMN "integratorPosition" SET DATA TYPE TEXT,
ALTER COLUMN "spotsOnScreen" DROP NOT NULL,
ALTER COLUMN "spotsOnScreen" DROP DEFAULT,
ALTER COLUMN "spotsOnScreen" SET DATA TYPE TEXT;
