import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { findPlayerWithoutActivity } from "../db/queries/players/players";
import { setPendingPlayersList } from "../cache/pendingPlayersList";

/**
 * Find players with lastActivty null.
 * This will most likely be players that either the scraping failed, or have privacy on runemtrics.
 * TODO - REMOVE THIS FUNCIONALITY -> It also includes players on the exception list if their activity have never been tracked.
 */
export async function listInvalidPlayers(interaction: ChatInputCommandInteraction) {
  try {
    let playersList = await findPlayerWithoutActivity();

    if (playersList.length === 0) {
      await interaction.followUp("No members found with invalid activity data.");

      return;
    }

    const invalidPlayersTable = [
      "``` ",
      "╒═════╤══════════════╤══════╤══════╕",
      "│  #  │ Player       │ rank │ xcep │",
      "│     │ name         │      │ tion │",
      "╞═════╪══════════════╪══════╪══════╡",
      ...playersList
        .map((member) => ({
          name: member.name,
          rank: member.rank,
          exception: member.isException ? "yes" : "no",
        }))
        .map((member, index) => {
          const name = member.name.padEnd(12).slice(0, 15);
          const rank = member.rank!.padEnd(4).slice(0, 4);
          const exception = member.exception.padEnd(4).slice(0, 4);
          const id = String(index + 1).padStart(3, " ");
          return `│ ${id} │ ${name} │ ${rank} │ ${exception} │`;
        }),
      "╘═════╧══════════════╧══════╧══════╛",
      "```",
    ].join("\n");

    const replyMessage = await interaction.editReply({
      embeds: [
        new EmbedBuilder({
          title: "Players with no activity recorded",
          description: invalidPlayersTable,
          color: 0xff0000,
          timestamp: new Date(),
        }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              custom_id: "activity_scan",
              label: "Update activity",
              style: ButtonStyle.Primary,
            }),
            new ButtonBuilder({
              custom_id: "exp_scan",
              label: "Update monthly exp",
              style: ButtonStyle.Primary,
            }),
          ],
        }),
      ],
    });

    setPendingPlayersList(replyMessage.id, playersList);
  } catch (error) {
    console.error("Error in findInvalidPlayers:", error);

    await interaction.followUp(
      `An error occurred while finding invalid players. ${error}`,
    );
  }
}
