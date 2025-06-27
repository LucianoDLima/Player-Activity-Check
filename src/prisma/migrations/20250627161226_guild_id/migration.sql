/*
  Warnings:

  - A unique constraint covering the columns `[guildID]` on the table `Clan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildID` to the `Clan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clan" ADD COLUMN     "guildID" TEXT NOT NULL,
ALTER COLUMN "name" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Clan_guildID_key" ON "Clan"("guildID");
