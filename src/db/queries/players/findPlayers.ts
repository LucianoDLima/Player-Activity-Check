import prisma from "../../../prisma/client.prisma";

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

export async function findPlayerWithoutActivity() {
  return prisma.member.findMany({
    where: {
      lastActivity: null,
      hasMonthlyExpGain: null,
      isException: false,
    },

    orderBy: { id: "asc" },
  });
}

export async function findPlayerByName(name: string) {
  return prisma.member.findUnique({
    where: { name },
  });
}
