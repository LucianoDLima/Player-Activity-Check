-- CreateTable
CREATE TABLE "Clan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Iron Rivals',
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "lastOnline" TIMESTAMP(3),
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "clanId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_name_key" ON "Member"("name");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
