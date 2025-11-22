/*
  Warnings:

  - The `status` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `projectorRunningHours` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `screenHeight` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `screenWidth` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `screenGain` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `throwDistance` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lampTotalRunningHours` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lampCurrentRunningHours` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flCenter` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flLeft` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flRight` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `whiteX` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `whiteY` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `whiteFl` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `redX` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `redY` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `redFl` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `greenX` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `greenY` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `greenFl` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blueX` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blueY` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blueFl` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hcho` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tvoc` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pm1` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pm2_5` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pm10` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `temperature` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `humidity` column on the `service_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Projector` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Site` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FIELD_WORKER');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PENDING', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Projector" DROP CONSTRAINT "Projector_siteId_fkey";

-- DropForeignKey
ALTER TABLE "service_record" DROP CONSTRAINT "service_record_projectorId_fkey";

-- DropForeignKey
ALTER TABLE "service_record" DROP CONSTRAINT "service_record_siteId_fkey";

-- AlterTable
ALTER TABLE "service_record" ADD COLUMN     "assignedToId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT',
DROP COLUMN "projectorRunningHours",
ADD COLUMN     "projectorRunningHours" INTEGER,
DROP COLUMN "screenHeight",
ADD COLUMN     "screenHeight" DOUBLE PRECISION,
DROP COLUMN "screenWidth",
ADD COLUMN     "screenWidth" DOUBLE PRECISION,
DROP COLUMN "screenGain",
ADD COLUMN     "screenGain" DOUBLE PRECISION,
DROP COLUMN "throwDistance",
ADD COLUMN     "throwDistance" DOUBLE PRECISION,
DROP COLUMN "lampTotalRunningHours",
ADD COLUMN     "lampTotalRunningHours" INTEGER,
DROP COLUMN "lampCurrentRunningHours",
ADD COLUMN     "lampCurrentRunningHours" INTEGER,
DROP COLUMN "flCenter",
ADD COLUMN     "flCenter" DOUBLE PRECISION,
DROP COLUMN "flLeft",
ADD COLUMN     "flLeft" DOUBLE PRECISION,
DROP COLUMN "flRight",
ADD COLUMN     "flRight" DOUBLE PRECISION,
DROP COLUMN "whiteX",
ADD COLUMN     "whiteX" DOUBLE PRECISION,
DROP COLUMN "whiteY",
ADD COLUMN     "whiteY" DOUBLE PRECISION,
DROP COLUMN "whiteFl",
ADD COLUMN     "whiteFl" DOUBLE PRECISION,
DROP COLUMN "redX",
ADD COLUMN     "redX" DOUBLE PRECISION,
DROP COLUMN "redY",
ADD COLUMN     "redY" DOUBLE PRECISION,
DROP COLUMN "redFl",
ADD COLUMN     "redFl" DOUBLE PRECISION,
DROP COLUMN "greenX",
ADD COLUMN     "greenX" DOUBLE PRECISION,
DROP COLUMN "greenY",
ADD COLUMN     "greenY" DOUBLE PRECISION,
DROP COLUMN "greenFl",
ADD COLUMN     "greenFl" DOUBLE PRECISION,
DROP COLUMN "blueX",
ADD COLUMN     "blueX" DOUBLE PRECISION,
DROP COLUMN "blueY",
ADD COLUMN     "blueY" DOUBLE PRECISION,
DROP COLUMN "blueFl",
ADD COLUMN     "blueFl" DOUBLE PRECISION,
DROP COLUMN "hcho",
ADD COLUMN     "hcho" DOUBLE PRECISION,
DROP COLUMN "tvoc",
ADD COLUMN     "tvoc" DOUBLE PRECISION,
DROP COLUMN "pm1",
ADD COLUMN     "pm1" DOUBLE PRECISION,
DROP COLUMN "pm2_5",
ADD COLUMN     "pm2_5" DOUBLE PRECISION,
DROP COLUMN "pm10",
ADD COLUMN     "pm10" DOUBLE PRECISION,
DROP COLUMN "temperature",
ADD COLUMN     "temperature" DOUBLE PRECISION,
DROP COLUMN "humidity",
ADD COLUMN     "humidity" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'FIELD_WORKER';

-- DropTable
DROP TABLE "Projector";

-- DropTable
DROP TABLE "Site";

-- CreateTable
CREATE TABLE "site" (
    "_id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactDetails" TEXT NOT NULL,
    "screenNo" TEXT NOT NULL,

    CONSTRAINT "site_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "projector" (
    "_id" TEXT NOT NULL,
    "projectorModel" TEXT NOT NULL,
    "serialNo" TEXT NOT NULL,
    "noOfservices" INTEGER,
    "runningHours" INTEGER,
    "siteId" TEXT NOT NULL,
    "lastServiceAt" TIMESTAMP(3),
    "nextServiceAt" TIMESTAMP(3),

    CONSTRAINT "projector_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_address_key" ON "site"("address");

-- CreateIndex
CREATE UNIQUE INDEX "projector_serialNo_key" ON "projector"("serialNo");

-- CreateIndex
CREATE INDEX "projector_lastServiceAt_idx" ON "projector"("lastServiceAt");

-- CreateIndex
CREATE INDEX "service_record_projectorId_status_idx" ON "service_record"("projectorId", "status");

-- CreateIndex
CREATE INDEX "service_record_status_idx" ON "service_record"("status");

-- CreateIndex
CREATE INDEX "service_record_assignedToId_idx" ON "service_record"("assignedToId");

-- AddForeignKey
ALTER TABLE "projector" ADD CONSTRAINT "projector_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "site"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_record" ADD CONSTRAINT "service_record_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_record" ADD CONSTRAINT "service_record_projectorId_fkey" FOREIGN KEY ("projectorId") REFERENCES "projector"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_record" ADD CONSTRAINT "service_record_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "site"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
