/*
  Warnings:

  - You are about to drop the column `evbImcbBoard` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `pibIcpBoard` on the `service_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "service_record" DROP COLUMN "evbImcbBoard",
DROP COLUMN "pibIcpBoard",
ADD COLUMN     "AirIntakeLadRad" TEXT,
ADD COLUMN     "AirIntakeLadRadNote" TEXT,
ADD COLUMN     "IcpBoard" TEXT,
ADD COLUMN     "IcpBoardNote" TEXT,
ADD COLUMN     "ImcbBoard" TEXT,
ADD COLUMN     "ImcbBoardNote" TEXT,
ADD COLUMN     "LightEnging4FourFans" TEXT,
ADD COLUMN     "LightEnging4FourFansNote" TEXT,
ADD COLUMN     "coolantLevelColorNote" TEXT,
ADD COLUMN     "evbBoard" TEXT,
ADD COLUMN     "evbBoardNote" TEXT,
ADD COLUMN     "lightEngineBlackNote" TEXT,
ADD COLUMN     "lightEngineBlueNote" TEXT,
ADD COLUMN     "lightEngineGreenNote" TEXT,
ADD COLUMN     "lightEngineRedNote" TEXT,
ADD COLUMN     "lightEngineWhiteNote" TEXT,
ADD COLUMN     "pibBoard" TEXT,
ADD COLUMN     "pibBoardNote" TEXT,
ADD COLUMN     "serialNumberVerifiedNote" TEXT,
ALTER COLUMN "serialNumberVerified" DROP NOT NULL,
ALTER COLUMN "serialNumberVerified" DROP DEFAULT,
ALTER COLUMN "serialNumberVerified" SET DATA TYPE TEXT;
