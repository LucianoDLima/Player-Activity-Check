import { Member } from "@prisma/client";
import { checkMonthlyExp } from "../../scraper/checkMonthlyExp";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { updatePlayerMonthlyExpGain } from "../../db/players";

export async function checkExp(
  interaction: ButtonInteraction,
  playerList: Member[],
) {
  let successCount = 0;
  let failCount = 0;
  let currentLoop = 1;
  let failedScanPositions = [];

  for (const player of playerList) {
    try {
      const gainThisMonth = await checkMonthlyExp(player.name);

      if (gainThisMonth) {
        const numericExp = parseInt(gainThisMonth.replace(/[^\d]/g, ""), 10);
        console.log("numericExp", numericExp);

        const hasMonthlyExpGain = numericExp > 0;
        console.log("exp gain", hasMonthlyExpGain);

        await updatePlayerMonthlyExpGain(player.name, hasMonthlyExpGain);

        successCount++;
      } else {
        failCount++;
        failedScanPositions.push(currentLoop);
      }
    } catch (error) {
      console.error(`Error checking exp for ${player.name}:`, error);
      failCount++;
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: "Exp Scan Progress",
          description: [
            `Last scanned: **${player.name}** (**${successCount + failCount}/${playerList.length}**)`,
            `- Successful scans: **${successCount}**`,
            `- Failed scans: **${failCount}**`,
            `  - Failed scans usually mean the player has privacy on.`,
            `- Failed users ID: **${failedScanPositions.join(" | ")}**`,
          ].join("\n"),
          color: 0xffff00,
        }),
      ],
    });

    currentLoop++;
  }

  await interaction.followUp({
    content: [
      `Update complete. Try /inactive again to see updated list.`,
      failCount > 0
        ? `Make sure to manually check the users that the scan couldn't find on runemetrics!`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
