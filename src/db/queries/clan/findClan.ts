import { Clan } from "@prisma/client";
import prisma from "../../../prisma/client.prisma";

export async function findClan(guildID: Clan["guildID"]) {
  return prisma.clan.findUnique({
    where: { guildID },
  });
}
