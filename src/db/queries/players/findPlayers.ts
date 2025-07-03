import { Clan } from "@prisma/client";
import prisma from "../../../prisma/client.prisma";

export async function findAllPlayers(guildID: Clan["guildID"]) {
  return prisma.member.findMany({
    where: {
      clan: {
        guildID,
      },
    },

    orderBy: { id: "asc" },
  });
}

export async function findManyPlayers(clanId: Clan["id"]) {
  return await prisma.member.findMany({
    where: { clanId },
    select: { name: true },
  });
}

export async function findPlayerByActivity(
  guildID: Clan["guildID"],
  isException: boolean = false,
) {
  return prisma.member.findMany({
    where: {
      lastActivity: {
        not: null,
      },
      isException,
      clan: {
        guildID,
      },
    },
    orderBy: { id: "asc" },
  });
}

export async function findPlayerWithoutActivity(guildID: Clan["guildID"]) {
  return prisma.member.findMany({
    where: {
      lastActivity: null,
      hasMonthlyExpGain: null,
      isException: false,
      clan: {
        guildID,
      },
    },
    orderBy: { id: "asc" },
  });
}

export async function findPlayerByName(name: string) {
  return prisma.member.findUnique({
    where: { name },
  });
}
