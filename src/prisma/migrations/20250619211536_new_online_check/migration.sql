/*
  Warnings:

  - You are about to drop the column `totalMembers` on the `Clan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clan" DROP COLUMN "totalMembers";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "hasMonthlyExpGain" BOOLEAN,
ADD COLUMN     "lastActivity" TIMESTAMP(3),
ALTER COLUMN "isGim" DROP NOT NULL,
ALTER COLUMN "isGim" DROP DEFAULT;
