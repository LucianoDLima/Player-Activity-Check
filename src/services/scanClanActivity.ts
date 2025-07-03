import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { formatName } from "../util/formatNames";
import { findAllPlayers } from "../db/queries/players/findPlayers";
import { fetchPlayerData } from "../scraper/fetchPlayerData";
import { checkPlayerActivity } from "../scraper/checkPlayerActivity";
import {
  updatePlayerInfo,
  updatePlayerLastActivity,
} from "../db/queries/players/updatePlayers";
import { verifyClanSetup } from "../util/guardCommands";

/**
 * Store following data about the player:
 * If they are a gim and their runescape ID through runepixels API.
 * Last activity tracked through scraping runemetrics (can take around 10 to 20 seconds per player).
 * TODO: EXP should be tracked here too if the last activity is > than 30 days.
 */
export async function scanClanActivity(interaction: ChatInputCommandInteraction) {
  try {
    const clan = await verifyClanSetup(interaction);
    if (!clan) return;

    await interaction.deferReply();

    const unfilteredPlayers = await findAllPlayers(clan.guildID);
    const players = unfilteredPlayers.filter((p) => p.lastActivity === null);

    if (players.length === 0) {
      await interaction.editReply(
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

    const discProgressMessage = await interaction.editReply({
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
          ((totalRegularPlayers - currentPlayerSearchCount) * 14) / 60,
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

        // const playerData = await fetchPlayerData(formattedName);

        const playerActivity = await checkPlayerActivity(formattedName);

        if (!playerActivity) {
          console.error(`Failed to fetch data for ${player.name}`);

          currentFailedScans++;
          continue;
        }

        // const isGim = playerData?.isGim;
        // const runescapeId = playerData?.runescapeId;

        // if (runescapeId || isGim) {
        //   await updatePlayerInfo(player.name, isGim!, runescapeId!);

        //   console.log(
        //     `${player.name}: ${isGim ? "GIM" : "Ironman"} player, RS3 ID: ${runescapeId}`,
        //   );
        // }

        if (playerActivity) {
          await updatePlayerLastActivity(player.name, playerActivity);

          console.log(
            `Updated ${player.name} with last activity: ${playerActivity}`,
          );
        }
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

    await interaction.followUp(
      `An error occurred while scanning the clan's activity. Please try again later or check the console.`,
    );
  }
}
