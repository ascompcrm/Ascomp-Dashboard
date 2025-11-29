/*
  Warnings:

  - You are about to drop the column `blueFl` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `blueX` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `blueY` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `disposableConsumables` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `flCenter` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `greenFl` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `greenX` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `greenY` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `redFl` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `redX` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `redY` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `whiteFl` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `whiteX` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `whiteY` on the `service_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "service_record" DROP COLUMN "blueFl",
DROP COLUMN "blueX",
DROP COLUMN "blueY",
DROP COLUMN "disposableConsumables",
DROP COLUMN "flCenter",
DROP COLUMN "greenFl",
DROP COLUMN "greenX",
DROP COLUMN "greenY",
DROP COLUMN "redFl",
DROP COLUMN "redX",
DROP COLUMN "redY",
DROP COLUMN "whiteFl",
DROP COLUMN "whiteX",
DROP COLUMN "whiteY",
ADD COLUMN     "airPollutionLevel" TEXT,
ADD COLUMN     "blue2Kfl" DOUBLE PRECISION,
ADD COLUMN     "blue2Kx" DOUBLE PRECISION,
ADD COLUMN     "blue2Ky" DOUBLE PRECISION,
ADD COLUMN     "blue4Kfl" DOUBLE PRECISION,
ADD COLUMN     "blue4Kx" DOUBLE PRECISION,
ADD COLUMN     "blue4Ky" DOUBLE PRECISION,
ADD COLUMN     "flatHeight" DOUBLE PRECISION,
ADD COLUMN     "flatWidth" DOUBLE PRECISION,
ADD COLUMN     "green2Kfl" DOUBLE PRECISION,
ADD COLUMN     "green2Kx" DOUBLE PRECISION,
ADD COLUMN     "green2Ky" DOUBLE PRECISION,
ADD COLUMN     "green4Kfl" DOUBLE PRECISION,
ADD COLUMN     "green4Kx" DOUBLE PRECISION,
ADD COLUMN     "green4Ky" DOUBLE PRECISION,
ADD COLUMN     "red2Kfl" DOUBLE PRECISION,
ADD COLUMN     "red2Kx" DOUBLE PRECISION,
ADD COLUMN     "red2Ky" DOUBLE PRECISION,
ADD COLUMN     "red4Kfl" DOUBLE PRECISION,
ADD COLUMN     "red4Kx" DOUBLE PRECISION,
ADD COLUMN     "red4Ky" DOUBLE PRECISION,
ADD COLUMN     "white2Kfl" DOUBLE PRECISION,
ADD COLUMN     "white2Kx" DOUBLE PRECISION,
ADD COLUMN     "white2Ky" DOUBLE PRECISION,
ADD COLUMN     "white4Kfl" DOUBLE PRECISION,
ADD COLUMN     "white4Kx" DOUBLE PRECISION,
ADD COLUMN     "white4Ky" DOUBLE PRECISION,
ADD COLUMN     "yes1" TEXT,
ADD COLUMN     "yes10" TEXT,
ADD COLUMN     "yes11" TEXT,
ADD COLUMN     "yes12" TEXT,
ADD COLUMN     "yes13" TEXT,
ADD COLUMN     "yes14" TEXT,
ADD COLUMN     "yes15" TEXT,
ADD COLUMN     "yes16" TEXT,
ADD COLUMN     "yes17" TEXT,
ADD COLUMN     "yes18" TEXT,
ADD COLUMN     "yes19" TEXT,
ADD COLUMN     "yes2" TEXT,
ADD COLUMN     "yes20" TEXT,
ADD COLUMN     "yes21" TEXT,
ADD COLUMN     "yes22" TEXT,
ADD COLUMN     "yes23" TEXT,
ADD COLUMN     "yes24" TEXT,
ADD COLUMN     "yes25" TEXT,
ADD COLUMN     "yes26" TEXT,
ADD COLUMN     "yes27" TEXT,
ADD COLUMN     "yes28" TEXT,
ADD COLUMN     "yes3" TEXT,
ADD COLUMN     "yes4" TEXT,
ADD COLUMN     "yes5" TEXT,
ADD COLUMN     "yes6" TEXT,
ADD COLUMN     "yes7" TEXT,
ADD COLUMN     "yes8" TEXT,
ADD COLUMN     "yes9" TEXT,
ALTER COLUMN "serviceNumber" SET DATA TYPE TEXT;
