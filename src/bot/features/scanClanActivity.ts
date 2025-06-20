import { Message } from "discord.js";
import { formatName } from "../../util/formatNames";
import { calculateDaysSinceLastActivity } from "../../util/formatDate";
import { findAllPlayers, updatePlayerData } from "../../db/players";
import { fetchPlayerData } from "../../scraper/fetchPlayerData";

/**
 * Checks the last time a player was online and add it to the database.
 * It does this by getting the last online from the api, and also the last activity tracked, as we are not sure if the last online is reliable on its own yet.
 * It also stores if the user is a gim player, and their runescape ID in case we can use it to check name changes.
 *
 * @param message The message the discord bot will send.
 * @param secs How many seconds to wait between each player's activity check. Necessary to avoid rate limiting.
 */
export async function scanClanActivity(message: Message, secs: number = 15) {
  try {
    const players = await findAllPlayers();

    const totalMembers = players.length;
    const progressMessage = await message.reply(
      `Checking activity: 0/${totalMembers}`,
    );
    message.reply(
      `Checking all players' activity (${totalMembers} members)... Please wait a moment.`,
    );

    let current = 1;

    for (const player of players) {
      try {
        if (player.isException) {
          console.log(`Skipping ${player.name} due to rank: ${player.rank}`);
          current++;

          continue;
        }

        const progressText = `Checking activity: ${current}/${totalMembers} (${player.name})`;
        await progressMessage.edit(progressText);

        const formattedName = formatName(player.name);

        const summary = await fetchPlayerData(formattedName);
        const lastOnline = summary?.lastOnline
          ? new Date(summary?.lastOnline)
          : null;
        const lastActivity = summary?.lastActivity
          ? new Date(summary?.lastActivity)
          : null;
        const isGim = summary?.isGim ?? false;
        const runescapeId = summary?.runescapeId;

        const daysSinceLastOnline = calculateDaysSinceLastActivity(lastOnline);
        const daysSinceLastActivity = calculateDaysSinceLastActivity(lastActivity);

        console.log(
          `${player.name} last online ${daysSinceLastOnline ?? "Never"} days ago`,
          `${player.name} last activity ${daysSinceLastActivity ?? "Never"} days ago`,
        );

        if (lastOnline || lastActivity) {
          await updatePlayerData(
            player.name,
            lastOnline,
            lastActivity,
            isGim,
            runescapeId,
          );

          console.log(`Updated ${formattedName} with lastOnline: ${lastOnline}`);
        }

        await new Promise((resolve) => setTimeout(resolve, secs * 1000));
      } catch (memberError) {
        console.error(`Error processing ${player.name}:`, memberError);
      }

      current++;
    }
  } catch (error) {
    console.error("Error scanning clan activity:", error);

    await message.reply(
      `An error occurred while scanning the clan's activity. Please try again later.`,
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
