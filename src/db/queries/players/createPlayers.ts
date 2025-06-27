import prisma from "../../../prisma/client.prisma";

export async function createPlayer(
  name: string,
  rank: string,
  clanId: number,
  isException: boolean = false,
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
