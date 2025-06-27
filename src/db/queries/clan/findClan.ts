import prisma from "../../../prisma/client.prisma";

export async function findClan(guildID: string) {
  return prisma.clan.findUnique({
    where: { guildID },
  });
}
