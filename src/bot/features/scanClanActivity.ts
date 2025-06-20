import { EmbedBuilder, Message } from "discord.js";
import { formatName } from "../../util/formatNames";
import { calculateDaysSinceLastActivity } from "../../util/formatDate";
import { findAllPlayers, updatePlayerData } from "../../db/players";
import { fetchPlayerData } from "../../scraper/fetchPlayerData";

/**
 * Checks the last time a player was online and add it to the database.
 * It does this by getting the last online from the api, and also the last activity tracked, as we are not sure if the last online is reliable on its own yet (it seems to be from my testing, but needs more testing just in case).
 * It also stores if the user is a gim player, and their runescape ID in case we can use it to check name changes.
 *
 * @param message The message the discord bot will send.
 * @param secs How many seconds to wait between each player's activity check. Necessary to avoid rate limiting.
 */
export async function scanClanActivity(message: Message, secs: number = 15) {
  try {
    const players = await findAllPlayers();

    const allPlayers = players.length;
    const regularPlayers = players.filter((p) => !p.isException);
    const exceptionPlayers = players.filter((p) => p.isException);

    const totalRegularPlayers = regularPlayers.length;
    const totalExceptionPlayers = exceptionPlayers.length;

    let discScanningPlayer = "**searching...**";
    let discAproxTimeLeft = "**calculating...**";

    let currentFailedScans = 0;
    let currentPlayerSearchCount = 1;

    const discProgressMessage = await message.reply({
      embeds: [
        new EmbedBuilder({
          title: `Clan Activity Scan`,
          description: [
            `### Updating players data`,
            `Please wait a moment, this may take a while. Players on the exception list will not be scammed.`,
            `- Total members: **${allPlayers}**`,
            `- On exception list: **${totalExceptionPlayers}**`,
            `- Players in queue: **0/${totalRegularPlayers}**`,
            `- Scanning player: **${discScanningPlayer}**`,
            `- Failed scans: **${currentFailedScans}**`,
            `*In case of failed scans, check the console.*`,
          ].join("\n"),
          footer: {
            text: `Approx time left: ${discAproxTimeLeft}`,
          },
          color: 0xff0000,
        }),
      ],
    });

    for (const player of regularPlayers) {
      try {
        discScanningPlayer = player.name;

        const aproxTimeLeft = Math.floor((totalRegularPlayers * (secs + 2)) / 60);

        discAproxTimeLeft = aproxTimeLeft.toString();

        await discProgressMessage.edit({
          embeds: [
            new EmbedBuilder({
              title: `Clan Activity Scan`,
              description: [
                `### Updating players data`,
                `Please wait a moment, this may take a while. Players on the exception list will not be scammed.`,
                `- Total members: **${allPlayers}**`,
                `- On exception list: **${totalExceptionPlayers}**`,
                `- Players in queue: **${currentPlayerSearchCount}/${totalRegularPlayers}**`,
                `- Scanning player: **${discScanningPlayer}**`,
                `- Failed scans: **${currentFailedScans}**`,
                `*In case of failed scans, check the console.*`,
              ].join("\n"),
              footer: {
                text: `Approx time left: **${discAproxTimeLeft} mins.**`,
              },
              color: 0xff0000,
            }),
          ],
        });

        const formattedName = formatName(player.name);

        const summary = await fetchPlayerData(formattedName);

        if (!summary) {
          console.error(`Failed to fetch data for ${player.name}`);

          currentFailedScans++;
          continue;
        }

        const lastOnline = summary.lastOnline ? new Date(summary?.lastOnline) : null;
        const lastActivity = summary.lastActivity
          ? new Date(summary.lastActivity)
          : null;
        const isGim = summary.isGim ?? false;
        const runescapeId = summary.runescapeId;

        const daysSinceLastOnline = calculateDaysSinceLastActivity(lastOnline);
        const daysSinceLastActivity = calculateDaysSinceLastActivity(lastActivity);

        console.log(
          `Player: ${player.name} \n last online: ${daysSinceLastOnline ?? "Never"} days ago \n`,
          `last activity: ${daysSinceLastActivity ?? "Never"} days ago`,
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
        // Aritificially wait to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, secs * 1000));
      } catch (memberError) {
        console.error(`Error processing ${player.name}:`, memberError);
      }

      currentPlayerSearchCount++;
    }
  } catch (error) {
    console.error("Error scanning clan activity:", error);

    await message.reply(
      `An error occurred while scanning the clan's activity. Please try again later or check the console.`,
    );
  }
}
