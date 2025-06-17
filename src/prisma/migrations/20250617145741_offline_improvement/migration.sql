-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "daysOffline" INTEGER,
ADD COLUMN     "isException" BOOLEAN NOT NULL DEFAULT false;
