import { EmbedBuilder, Message } from "discord.js";
import { formatName } from "../../util/formatNames";
import {
  findAllPlayers,
  updatePlayerInfo,
  updatePlayerLastActivity,
} from "../../db/players";
import { fetchPlayerData } from "../../scraper/fetchPlayerData";
import { checkPlayerActivity } from "../../scraper/checkPlayerActivity";

/**
 * Store some data about the player:
 * If they are a gim and their runescape ID through runepixels API.
 * Last activity tracked through scraping runemetrics (can take around 10 to 20 seconds per player).
 *
 * @param message The message the discord bot will send.
 * @param secs How many seconds to wait between each player's activity check. Necessary to avoid rate limiting.
 */
export async function scanClanActivity(message: Message, secs: number = 15) {
  try {
    const unfilteredPlayers = await findAllPlayers();
    const players = unfilteredPlayers.filter(
      (p) => !p.runescapeId || p.lastActivity === null,
    );

    if (players.length === 0) {
      await message.reply(
        "No players found in the clan. Please populate the clan first.",
      );

      return;
    }

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

        const aproxTimeLeft = Math.floor(
          ((totalRegularPlayers - currentPlayerSearchCount) * (secs + 14)) / 60,
        );

        discAproxTimeLeft =
          aproxTimeLeft.toString() === "0"
            ? "less than 1 min."
            : `${aproxTimeLeft} mins.`;

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
                text: `Approx time left: ${discAproxTimeLeft}`,
              },
              color: 0xff0000,
            }),
          ],
        });

        const formattedName = formatName(player.name);

        const playerData = await fetchPlayerData(formattedName);

        const playerActivity = await checkPlayerActivity(formattedName);

        if (!playerData && !playerActivity) {
          console.error(`Failed to fetch data for ${player.name}`);

          currentFailedScans++;
          continue;
        }

        const isGim = playerData?.isGim;
        const runescapeId = playerData?.runescapeId;

        if (runescapeId || isGim) {
          await updatePlayerInfo(player.name, isGim!, runescapeId!);

          console.log(
            `${player.name}: ${isGim ? "GIM" : "Ironman"} player, RS3 ID: ${runescapeId}`,
          );
        }

        if (playerActivity) {
          await updatePlayerLastActivity(player.name, playerActivity);

          console.log(
            `Updated ${player.name} with last activity: ${playerActivity}`,
          );
        }
        // Aritificially wait to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, secs * 1000));
      } catch (memberError) {
        console.error(`Error processing ${player.name}:`, memberError);
      }

      currentPlayerSearchCount++;
    }

    await discProgressMessage.reply({
      embeds: [
        new EmbedBuilder({
          title: `Clan Activity Scan`,
          description: [
            `### Update completed`,
            `- You can run /invactive to see the list of inactive players.`,
            `- You can run /invalid to see the list of players the scan failed.`,
            `- You can run /scan again to try updating only the players that failed.`,
          ].join("\n"),
          color: 0x00ff00,
        }),
      ],
    });
  } catch (error) {
    console.error("Error scanning clan activity:", error);

    await message.reply(
      `An error occurred while scanning the clan's activity. Please try again later or check the console.`,
    );
  }
}
