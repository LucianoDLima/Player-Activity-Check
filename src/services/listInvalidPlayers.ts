import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { findPlayerWithoutActivity } from "../db/queries/players/findPlayers";
import { setPendingPlayersList } from "../cache/pendingPlayersList";
import { Member } from "@prisma/client";

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

    const { embed, buttons } = buildInvalidListEmbed(playersList);

    const replyMessage = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
    });

    setPendingPlayersList(replyMessage.id, playersList);
  } catch (error) {
    console.error("Error in findInvalidPlayers:", error);

    await interaction.followUp(
      `An error occurred while finding invalid players. ${error}`,
    );
  }
}

function buildInvalidListEmbed(players: Member[]) {
  const WIDTH = {
    id: 3,
    name: 12,
    rank: 12,
  } as const;

  const embedDescription = [
    "``` ",
    "╒═════╤══════════════╤══════════════╕",
    "│  #  │ Player       │ Rank         │",
    "╞═════╪══════════════╪══════════════╡",
    ...players.map((member, index) => {
      const id = String(index + 1).padStart(WIDTH.id);
      const name = member.name.padEnd(WIDTH.name);
      const rank = member.rank!.padEnd(WIDTH.rank).slice(0, WIDTH.rank);
      return `│ ${id} │ ${name} │ ${rank} │`;
    }),
    "╘═════╧══════════════╧══════════════╛",
    "```",
  ].join("\n");

  const embed = new EmbedBuilder()
    .setTitle("Invalid Players List")
    .setDescription(embedDescription)
    .setColor(0xff0000);

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("activity_scan")
      .setLabel("Update activity")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("exp_scan")
      .setLabel("Update monthly exp")
      .setStyle(ButtonStyle.Primary),
  );

  return { embed, buttons };
}
