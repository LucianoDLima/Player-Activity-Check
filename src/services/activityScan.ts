import { formatName } from "../util/formatNames";
import { scrapePlayerActivity } from "../scraper/scrapePlayerActivity";
import { Member } from "@prisma/client";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { updatePlayerLastActivity } from "../db/queries/players/updatePlayers";
import { verifyClanSetup } from "../util/guardCommands";

/**
 * Moved the logic to scanClanActivity, however this might still be needed.
 * My idea is to first try scanClanActivity, and if it fails, scrape the runemetrics page directly with this function.
 * The scanClanActivity uses their api, which is more reliable and faster, but I hear can be rate limited tho it is very inconsistent.
 */

export async function handleActivityScan(
  interaction: ButtonInteraction,
  playerList: Member[],
) {
  const clan = await verifyClanSetup(interaction);
  if (!clan) return;

  await interaction.deferReply();

  const players = playerList;

  let successfulScan = 0;
  let failedScan = 0;
  const failedScanPositions = [];
  let currentLoop = 1;

  try {
    for (const player of players) {
      const scannedPlayer = await scanPlayer(player);

      if (scannedPlayer) {
        successfulScan++;
      } else {
        failedScan++;
        failedScanPositions.push(currentLoop);
      }

      currentLoop++;

      const { embed } = buildHandleActivityScanEmbed(
        players,
        player,
        successfulScan,
        failedScan,
        failedScanPositions,
      );

      await interaction.editReply({
        embeds: [embed],
      });
    }

    await interaction.followUp({
      content: [
        "Update complete.",
        "- Try /inactive to see the list of inactive players.",
        "- Try /invalid to see the list of players the scan failed.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Error checking all players' activity:", error);

    await interaction.followUp({
      content: `An error occurred during the scan. Please check the logs`,
    });
  }
}

async function scanPlayer(player: Member) {
  try {
    const formattedName = formatName(player.name);
    const lastActivity = await scrapePlayerActivity(formattedName);

    if (lastActivity) {
      await updatePlayerLastActivity(player.name, lastActivity);
      console.log(`Updated ${formattedName} with lastActivity: ${lastActivity}`);

      return true;
    }

    console.log(`Scan failed for ${player.name}: No activity data found.`);

    return false;
  } catch (error) {
    console.error(`Error processing ${player.name}:`, error);

    return false;
  }
}

function buildHandleActivityScanEmbed(
  playerList: Member[],
  player: Member,
  successfulScan: number,
  failedScan: number,
  failedScanPositions: number[],
) {
  const embedDescription = [
    `Last scanned: ${player.name}... (${successfulScan + failedScan}/${playerList.length})`,
    ``,
    `- Successful scans: **${successfulScan}**`,
    `- Failed scans: **${failedScan}**`,
    `  - Failed scans usually mean the player has changed privacy on.`,
    `- Failed users ID: ${failedScanPositions.length ? `**${failedScanPositions.join(" | ")}**` : ""}`,
  ];

  const embed = new EmbedBuilder()
    .setTitle("Activity Scan Progress")
    .setDescription(embedDescription.join("\n"))
    .setColor(0x00ff00);

  return { embed };
}
