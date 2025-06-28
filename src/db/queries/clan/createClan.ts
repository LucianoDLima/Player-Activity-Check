import { Clan } from "@prisma/client";
import prisma from "../../../prisma/client.prisma";

export async function createClan(guildID: Clan["guildID"], name: string) {
  return prisma.clan.create({
    data: {
      guildID,
      name,
    },
  });
}
