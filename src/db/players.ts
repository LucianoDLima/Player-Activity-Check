import prisma from "../prisma/client.prisma";

export async function findAllPlayers() {
  return prisma.member.findMany({
    orderBy: { id: "asc" },
  });
}

export async function findPlayerByActivity(exception: boolean = false) {
  return prisma.member.findMany({
    where: {
      lastOnline: {
        not: null,
      },
      isException: exception,
    },

    orderBy: { id: "asc" },
  });
}

export async function findPlayerWithoutActivity(exception: boolean = false) {
  return prisma.member.findMany({
    where: {
      lastOnline: null,
      isException: exception,
    },

    orderBy: { id: "asc" },
  });
}

export async function findPlayerByName(name: string) {
  return prisma.member.findUnique({
    where: { name: name },
  });
}

export async function createPlayer(
  player: string,
  rank: string,
  clanId: number,
  isException = false,
) {
  return prisma.member.create({
    data: {
      name: player,
      rank: rank,
      clanId: clanId,
      isException,
    },
  });
}

export async function updatePlayerData(
  name: string,
  lastOnline: Date | null = null,
  lastActivity: Date | null = null,
  isGim: boolean = false,
  runescapeId: number | null = null,
) {
  return prisma.member.update({
    where: { name },
    data: {
      lastOnline,
      lastActivity,
      isGim,
      runescapeId,
    },
  });
}

export async function updatePlayerLastActivity(name: string, lastActivity: Date) {
  return prisma.member.update({
    where: { name: name },
    data: { lastActivity: lastActivity },
  });
}
