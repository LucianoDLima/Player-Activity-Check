import prisma from "../prisma/client.prisma";

export async function findAllPlayers() {
  return prisma.member.findMany({
    orderBy: { id: "asc" },
  });
}

export async function findPlayerByActivity(isException: boolean = false) {
  return prisma.member.findMany({
    where: {
      lastActivity: {
        not: null,
      },
      isException,
    },

    orderBy: { id: "asc" },
  });
}

export async function findPlayerWithoutActivity(isException: boolean = false) {
  return prisma.member.findMany({
    where: {
      lastActivity: null,
      isException,
    },

    orderBy: { id: "asc" },
  });
}

export async function findPlayerByName(name: string) {
  return prisma.member.findUnique({
    where: { name },
  });
}

export async function createPlayer(
  name: string,
  rank: string,
  clanId: number,
  isException = false,
) {
  return prisma.member.create({
    data: {
      name,
      rank,
      clanId,
      isException,
    },
  });
}

export async function updatePlayerInfo(
  name: string,
  isGim: boolean,
  runescapeId: number | null,
) {
  return prisma.member.update({
    where: { name },
    data: {
      isGim,
      runescapeId,
    },
  });
}

export async function updatePlayerLastActivity(name: string, lastActivity: Date) {
  return prisma.member.update({
    where: { name },
    data: { lastActivity },
  });
}

export async function updatePlayerMonthlyExpGain(
  name: string,
  hasMonthlyExpGain: boolean,
) {
  return prisma.member.update({
    where: { name },
    data: { hasMonthlyExpGain },
  });
}
