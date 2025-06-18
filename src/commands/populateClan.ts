import { Message } from "discord.js";
import prisma from "../prisma/client.prisma";
import {
  checkNumberOfPages,
  scrapeHiscorePage,
} from "../scraper/getListOfMembersOfficial";
import { handleIsException } from "../util/exceptions";

/**
 * Fetche all members of the clan and insert them, as well as their ranks, into the database.
 */
export async function populateClan(message: Message) {
  const numberOfPages = await checkNumberOfPages();
  const discordMessage = await message.reply(`Fetching all players...`);

  // TODO: Just for creating the clan if it doesn't exist. Should probably be removed, we'll see
  const clan = await prisma.clan.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: "Iron Rivals",
    },
  });

  discordMessage.edit(`Fetching all players. Please wait a moment.`);

  let skippedCount = 0;
  let addedCount = 0;

  for (let page = 1; page <= numberOfPages; page++) {
    const players = (await scrapeHiscorePage(page)).slice(1);

    discordMessage.edit(`Fetching all players. Please wait a moment.
      Loading (${page}/${numberOfPages})...
      Skipped: ${skippedCount}
      Added: ${addedCount}`);

    for (const player of players) {
      const existingPlayer = await prisma.member.findUnique({
        where: { name: player.name },
      });

      if (existingPlayer) {
        skippedCount++;
        console.log(`Skipping duplicate: ${player.name}`);

        continue;
      }

      const isException = handleIsException(player.rank);

      try {
        await prisma.member.create({
          data: {
            name: player.name,
            rank: player.rank,
            clanId: clan.id,
            isException,
          },
        });
        addedCount++;

        console.log(`Inserted: ${player.name} - ${player.rank}`);
      } catch (error) {
        console.error(`Failed to insert ${player.name}:`, error);
      }
    }
  }

  discordMessage.edit(`All players fetched successfully!
      Skipped: ${skippedCount}
      Added: ${addedCount}`);
}
