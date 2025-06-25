import { formatName } from "../util/formatNames";
import { checkPlayerActivity } from "../scraper/checkPlayerActivity";
import { calcDaysSince } from "../util/formatDate";
import { updatePlayerLastActivity } from "../db/queries/players/players";
import { Member } from "@prisma/client";
import { ButtonInteraction, EmbedBuilder } from "discord.js"; // Import ButtonInteraction

/**
 * Moved the logic to scanClanActivity, however this might still be needed.
 * My idea is to first try scanClanActivity, and if it fails, scrape the runemetrics page directly with this function.
 * The scanClanActivity uses their api, which is more reliable and faster, but I hear can be rate limited tho it is very inconsistent.
 */

export async function checkAllPlayersActivity(
  interaction: ButtonInteraction,
  playerList: Member[],
) {
  try {
    let allPlayers = playerList;

    let successfulScan = 0;
    let failedScan = 0;
    let failedScanPositions = [];
    let currentLoop = 1;

    for (const player of allPlayers) {
      try {
        const formattedName = formatName(player.name);
        const lastActivity = await checkPlayerActivity(formattedName);
        const daysSinceLastActivity = calcDaysSince(lastActivity);

        console.log(
          `${player.name} last activity on DB ${daysSinceLastActivity ?? "Never"} days ago`,
        );

        if (lastActivity) {
          await updatePlayerLastActivity(player.name, lastActivity);
          console.log(`Updated ${formattedName} with lastActivity: ${lastActivity}`);
        }

        if (!lastActivity) {
          failedScan++;
          successfulScan--;

          failedScanPositions.push(currentLoop);
        }
      } catch (playerError) {
        console.error(`Error processing ${player.name}:`, playerError);

        await interaction.followUp(
          `Error processing ${player.name}: Check the logs for details.`,
        );
      }

      successfulScan++;
      currentLoop++;

      await interaction.editReply({
        embeds: [
          new EmbedBuilder({
            title: "Activity Scan Progress",
            description: [
              `Last scanned: ${player.name}... (${successfulScan + failedScan}/${playerList.length})`,
              ``,
              `- Successful scans: **${successfulScan}**`,
              `- Failed scans: **${failedScan}**`,
              `  - Failed scans usually mean the player has changed privacy on.`,
              `- Failed users ID: **${failedScanPositions.join(" | ")}**`,
            ].join("\n"),
            color: 0x00ff00,
          }),
        ],
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
