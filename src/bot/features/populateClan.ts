import { EmbedBuilder, Message } from "discord.js";
import prisma from "../../prisma/client.prisma";
import { scrapeHiscorePage } from "../../scraper/getListOfMembersOfficial";
import { handleIsException } from "../../util/exceptions";
import { getNumberOfPages } from "../../scraper/getNumberOfPages";
import { createPlayer, findPlayerByName } from "../../db/players";

/**
 * Fetch all members of the clan and insert them, as well as their ranks, into the database.
 *
 * @param message The discord bot message that will be sent.
 */
export async function populateClan(message: Message) {
  let discordMessage: Message | null = null;

  try {
    const numberOfPages = await getNumberOfPages();

    discordMessage = await message.reply({
      embeds: [
        new EmbedBuilder({
          title: `Populating list of members`,
          description: ["### Please wait a moment, this may take a while."].join(
            "\n",
          ),
          color: 0xff0000,
          timestamp: new Date(),
        }),
      ],
    });

    // TODO: Just for creating the clan if it doesn't exist. Should probably be removed, we'll see
    const clan = await prisma.clan.upsert({
      where: { id: 7 },
      update: {},
      create: {
        name: "Iron Rivals",
      },
    });

    let skippedCount = 0;
    let addedCount = 0;

    for (let page = 1; page <= numberOfPages; page++) {
      // Scrape players' name and rank
      const players = (await scrapeHiscorePage(page)).slice(1);

      await discordMessage.edit({
        embeds: [
          new EmbedBuilder({
            title: `Populating list of members`,
            description: [
              `### Please wait a moment, this may take a while.`,
              `Players are skipped if they already exist in the database.`,
              ``,
              `Loading (${page}/${numberOfPages})...`,
              `Skipped: ${skippedCount}`,
              `Added: ${addedCount}`,
            ].join("\n"),
            color: 0xff0000,
            timestamp: new Date(),
          }),
        ],
      });

      // Add scraped users to database, or skip if they're already in it
      for (const player of players) {
        try {
          const existingPlayer = await findPlayerByName(player.name);

          if (existingPlayer) {
            skippedCount++;
            console.log(`Skipping duplicate: ${player.name}`);

            continue;
          }

          const isException = handleIsException(player.rank);

          await createPlayer(player.name, player.rank, clan.id, isException);

          addedCount++;

          console.log(`Inserted: ${player.name} - ${player.rank}`);
        } catch (error) {
          console.error(`Error inserting player: ${player.name}`, error);
        }
      }
    }

    await discordMessage.edit({
      embeds: [
        new EmbedBuilder({
          title: `Populating list of members`,
          description: [
            `### PROCESS COMPLETE!`,
            `Players are skipped if they already exist in the database.`,
            `\n`,
            `Players skipped: ${skippedCount}`,
            `Players added: ${addedCount}`,
          ].join("\n"),
          color: 0x00ff00,
          timestamp: new Date(),
        }),
      ],
    });
  } catch (error) {
    console.error("Error populating clan:", error);

    if (discordMessage) {
      discordMessage?.reply(`Error populating clan: ${error}`);
    }
  }
}
