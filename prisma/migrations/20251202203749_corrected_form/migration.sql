/*
  Warnings:

  - You are about to drop the column `LightEnging4FourFans` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `LightEnging4FourFansNote` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `evbImcbBoardNote` on the `service_record` table. All the data in the column will be lost.
  - You are about to drop the column `pibIcpBoardNote` on the `service_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "service_record" DROP COLUMN "LightEnging4FourFans",
DROP COLUMN "LightEnging4FourFansNote",
DROP COLUMN "evbImcbBoardNote",
DROP COLUMN "pibIcpBoardNote";
