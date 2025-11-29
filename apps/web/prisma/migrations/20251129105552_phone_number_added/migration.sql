/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "service_record" ADD COLUMN     "acBlowerVaneNote" TEXT,
ADD COLUMN     "cardCageFansNote" TEXT,
ADD COLUMN     "coldMirrorNote" TEXT,
ADD COLUMN     "evbImcbBoardNote" TEXT,
ADD COLUMN     "extractorVaneNote" TEXT,
ADD COLUMN     "foldMirrorNote" TEXT,
ADD COLUMN     "imbSBoardNote" TEXT,
ADD COLUMN     "integratorRodNote" TEXT,
ADD COLUMN     "lampLocMechanismNote" TEXT,
ADD COLUMN     "lightEngineFansNote" TEXT,
ADD COLUMN     "pibIcpBoardNote" TEXT,
ADD COLUMN     "pumpConnectorHoseNote" TEXT,
ADD COLUMN     "radiatorFanPumpNote" TEXT,
ADD COLUMN     "reflectorNote" TEXT,
ADD COLUMN     "touchPanelNote" TEXT,
ADD COLUMN     "uvFilterNote" TEXT,
ADD COLUMN     "yes10Note" TEXT,
ADD COLUMN     "yes11Note" TEXT,
ADD COLUMN     "yes12Note" TEXT,
ADD COLUMN     "yes13Note" TEXT,
ADD COLUMN     "yes14Note" TEXT,
ADD COLUMN     "yes15Note" TEXT,
ADD COLUMN     "yes16Note" TEXT,
ADD COLUMN     "yes17Note" TEXT,
ADD COLUMN     "yes18Note" TEXT,
ADD COLUMN     "yes19Note" TEXT,
ADD COLUMN     "yes1Note" TEXT,
ADD COLUMN     "yes20Note" TEXT,
ADD COLUMN     "yes21Note" TEXT,
ADD COLUMN     "yes22Note" TEXT,
ADD COLUMN     "yes23Note" TEXT,
ADD COLUMN     "yes24Note" TEXT,
ADD COLUMN     "yes25Note" TEXT,
ADD COLUMN     "yes26Note" TEXT,
ADD COLUMN     "yes27Note" TEXT,
ADD COLUMN     "yes28Note" TEXT,
ADD COLUMN     "yes2Note" TEXT,
ADD COLUMN     "yes3Note" TEXT,
ADD COLUMN     "yes4Note" TEXT,
ADD COLUMN     "yes5Note" TEXT,
ADD COLUMN     "yes6Note" TEXT,
ADD COLUMN     "yes7Note" TEXT,
ADD COLUMN     "yes8Note" TEXT,
ADD COLUMN     "yes9Note" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");
