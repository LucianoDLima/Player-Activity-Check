import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { scrapeHiscorePage } from "../scraper/getListOfMembersOfficial";
import { handleIsException } from "../util/exceptions";
import { getNumberOfPages } from "../scraper/getNumberOfPages";
import { createPlayer } from "../db/queries/players/createPlayers";
import { findClan } from "../db/queries/clan/findClan";
import { findPlayerByName } from "../db/queries/players/findPlayers";
import { verifyClanSetup } from "../util/commandGuard";

/**
 * Fetch all members of the clan and insert them, as well as their ranks, into the database.
 */
export async function populateClan(interaction: ChatInputCommandInteraction) {
  try {
    const clanSetup = await verifyClanSetup(interaction);
    if (!clanSetup) return;

    const numberOfPages = await getNumberOfPages();

    await interaction.editReply({
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

    const clan = await findClan(process.env.GUILD_ID!);

    if (!clan) {
      throw new Error("Clan not found in the database");
    }

    let skippedCount = 0;
    let addedCount = 0;

    for (let page = 1; page <= numberOfPages; page++) {
      // Scrape players' name and rank
      const players = (await scrapeHiscorePage(page)).slice(1);

      await interaction.editReply({
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

    await interaction.editReply({
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
  }
}
