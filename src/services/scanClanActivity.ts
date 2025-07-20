import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { formatName } from "../util/formatNames";
import { findAllPlayers } from "../db/queries/players/findPlayers";
import { scrapePlayerActivity } from "../scraper/scrapePlayerActivity";
import { updatePlayerLastActivity } from "../db/queries/players/updatePlayers";
import { verifyClanSetup } from "../util/guardCommands";
import { embedCons } from "../constants/embeds";

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
      const { errorEmbed } = buildErrorEmbed();

      await interaction.editReply({
        embeds: [errorEmbed],
      });

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
    let currentSuccessScans = 0;
    let currentPlayerSearchCount = 0;

    for (const player of regularPlayers) {
      try {
        discScanningPlayer = player.name;

        const aproxTimeLeft = Math.floor(
          ((totalRegularPlayers - (currentPlayerSearchCount + 1)) * 14) / 60,
        );

        discAproxTimeLeft =
          aproxTimeLeft.toString() === "0"
            ? "less than 1 min."
            : `${aproxTimeLeft} mins.`;

        const { progressEmbed } = buildProgressEmbed({
          totalPlayers: allPlayers,
          exceptionPlayers: totalExceptionPlayers,
          searchCount: currentPlayerSearchCount,
          regularPlayers: totalRegularPlayers,
          playerScanning: discScanningPlayer,
          successScans: currentSuccessScans,
          failedScans: currentFailedScans,
          timeLeft: discAproxTimeLeft,
        });

        await interaction.editReply({
          embeds: [progressEmbed],
        });

        const formattedName = formatName(player.name);

        const playerActivity = await scrapePlayerActivity(formattedName);

        if (!playerActivity) {
          console.error(`Failed to fetch data for ${player.name}`);

          currentFailedScans++;
          currentPlayerSearchCount++;
          continue;
        }

        if (playerActivity) {
          await updatePlayerLastActivity(player.name, playerActivity);

          console.log(
            `Updated ${player.name} with last activity: ${playerActivity}`,
          );
        }
      } catch (memberError) {
        console.error(`Error processing ${player.name}:`, memberError);
      }

      currentSuccessScans++;
      currentPlayerSearchCount++;
    }

    await interaction.followUp({
      content: `Clan activity scan completed**!`,
      flags: MessageFlags.Ephemeral,
    });

    const { successEmbed } = buildSuccessEmbed({
      totalPlayers: allPlayers,
      exceptionPlayers: totalExceptionPlayers,
      searchCount: currentPlayerSearchCount,
      regularPlayers: totalRegularPlayers,
      successScans: currentSuccessScans,
      failedScans: currentFailedScans,
    });

    await interaction.editReply({
      embeds: [successEmbed],
    });
  } catch (error) {
    console.error("Error scanning clan activity:", error);

    await interaction.followUp(
      `An error occurred while scanning the clan's activity. Please try again later or check the console.`,
    );
  }
}

interface IProgressEmbed {
  totalPlayers: number;
  exceptionPlayers: number;
  searchCount: number;
  regularPlayers: number;
  playerScanning: string;
  failedScans: number;
  successScans: number;
  timeLeft: string;
}

function buildProgressEmbed(state: IProgressEmbed) {
  const embedDescription = [
    `### Updating players data`,
    `Please wait a moment, this may take a while. Staff and players on the exception list will not be scanned.`,
    `- Total members: **${state.totalPlayers}**`,
    `- Staff/exception list: **${state.exceptionPlayers}**`,
    `- Scanning player: **${state.playerScanning}**`,
    `- Players scanned: **${state.searchCount}/${state.regularPlayers}**`,
    `  - Successful scans: **${state.successScans}/${state.searchCount}**`,
    `  - Failed scans: **${state.failedScans}/${state.searchCount}**`,
    `*After scanning is complete, run \`/invalid\` to see players with failed scans.*`,
  ];

  const progressEmbed = new EmbedBuilder()
    .setTitle("Clan activity scan")
    .setDescription(embedDescription.join("\n"))
    .setColor(embedCons.color.PROGRESS)
    .setFooter({
      text: `Approx time left: ${state.timeLeft}`,
    });

  return { progressEmbed };
}

function buildSuccessEmbed(
  state: Omit<IProgressEmbed, "timeLeft" | "playerScanning">,
) {
  const embedDescription = [
    `### Update completed`,
    `- You can run \`/inactive\` to see the list of inactive players.`,
    `- You can run \`/invalid\` to see the list of players the scan failed.`,
    `- You can run \`/scan\` again to try updating only the players that failed or newly added members.`,
    "",
    "### Log",
    `- Total members: **${state.totalPlayers}**`,
    `- Staff/exception list: **${state.exceptionPlayers}**`,
    `- Players scanned: **${state.searchCount}/${state.regularPlayers}**`,
    `  - Successful scans: **${state.successScans}/${state.searchCount}**`,
    `  - Failed scans: **${state.failedScans}/${state.searchCount}**`,
  ];

  const successEmbed = new EmbedBuilder()
    .setTitle("Clan activity scan")
    .setDescription(embedDescription.join("\n"))
    .setColor(embedCons.color.SUCCCESS);

  return { successEmbed };
}

function buildErrorEmbed() {
  const embedDescription = [
    `### No players found`,
    `Please run \`/populate\` first to add members to the clan.`,
  ];

  const errorEmbed = new EmbedBuilder()
    .setDescription(embedDescription.join("\n"))
    .setColor(embedCons.color.ERROR);

  return { errorEmbed };
}
