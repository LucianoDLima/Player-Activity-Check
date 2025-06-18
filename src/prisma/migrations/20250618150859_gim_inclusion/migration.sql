/*
  Warnings:

  - You are about to drop the column `daysOffline` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `isStale` on the `Member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Member" DROP COLUMN "daysOffline",
DROP COLUMN "isStale",
ADD COLUMN     "isGim" BOOLEAN NOT NULL DEFAULT false;
