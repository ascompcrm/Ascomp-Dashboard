/*
  Warnings:

  - You are about to drop the column `region` on the `site` table. All the data in the column will be lost.
  - You are about to drop the column `screenNo` on the `site` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `site` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site" DROP COLUMN "region",
DROP COLUMN "screenNo",
DROP COLUMN "state";
