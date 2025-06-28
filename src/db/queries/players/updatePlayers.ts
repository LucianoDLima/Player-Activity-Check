import prisma from "../../../prisma/client.prisma";

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

export async function updatePlayerLastActivity(
  name: string,
  lastActivity: Date,
  lastCheckForActivity: Date = new Date(),
) {
  return prisma.member.update({
    where: { name },
    data: { lastActivity, lastCheckForActivity },
  });
}

export async function updatePlayerMonthlyExpGain(
  name: string,
  hasMonthlyExpGain: boolean,
  lastCheckForExpGain: Date = new Date(),
) {
  return prisma.member.update({
    where: { name },
    data: { hasMonthlyExpGain, lastCheckForExpGain },
  });
}
