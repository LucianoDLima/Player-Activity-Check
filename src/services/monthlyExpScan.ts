import { Member } from "@prisma/client";
import { checkMonthlyExp } from "../scraper/checkMonthlyExp";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { updatePlayerMonthlyExpGain } from "../db/queries/players/players";

export async function handleMonthlyExpScan(
  interaction: ButtonInteraction,
  players: Member[],
) {
  let successCount = 0;
  let failCount = 0;
  let currentLoop = 1;
  let failedScanPositions = [];

  try {
    for (const player of players) {
      const scannedPlayer = await scanMonthlyExp(player);

      if (scannedPlayer) {
        successCount++;
      } else {
        failCount++;
        failedScanPositions.push(currentLoop);
      }

      currentLoop++;

      const { embed } = buildMonthlyExpScanEmbed(
        players,
        player,
        successCount,
        failCount,
        failedScanPositions,
      );

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.log(`Error fetching exp`, error);

    await interaction.followUp({
      content: `An error occurred during the scan. Please check the logs`,
    });
  }
}

async function scanMonthlyExp(player: Member) {
  try {
    const gainThisMonth = await checkMonthlyExp(player.name);

    if (gainThisMonth) {
      const numericExp = parseInt(gainThisMonth.replace(/[^\d]/g, ""), 10);
      const hasMonthlyExpGain = numericExp > 0;
      console.log("numericExp: ", numericExp);

      await updatePlayerMonthlyExpGain(player.name, hasMonthlyExpGain);
      console.log(`Updated ${player.name}. Exp gained: ${hasMonthlyExpGain}`);

      return true;
    }

    console.log(`Scan failed for ${player.name}: No activity data found.`);

    return false;
  } catch (error) {
    console.error(`Error processing ${player.name}:`, error);

    return false;
  }
}

function buildMonthlyExpScanEmbed(
  playerList: Member[],
  player: Member,
  successCount: number,
  failCount: number,
  failedScanPositions: number[],
) {
  const embedDescription = [
    `Last scanned: **${player.name}** (**${successCount + failCount}/${playerList.length}**)`,
    `- Successful scans: **${successCount}**`,
    `- Failed scans: **${failCount}**`,
    `  - Failed scans usually mean the player has privacy on.`,
    `- Failed users ID: ${failedScanPositions.length ? `**${failedScanPositions.join(" | ")}**` : ""}`,
  ];

  const embed = new EmbedBuilder()
    .setTitle("Exp Scan Progress")
    .setDescription(embedDescription.join("\n"))
    .setColor(0x00ff00);

  return { embed };
}
