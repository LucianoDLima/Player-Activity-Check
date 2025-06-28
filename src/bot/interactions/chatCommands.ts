import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { listInactives } from "../../services/listInactives";
import { explainCommands } from "../../services/help";
import { populateClan } from "../../services/populateClan";
import { scanClanActivity } from "../../services/scanClanActivity";
import { listInvalidPlayers } from "../../services/listInvalidPlayers";
import { listClanMembers } from "../../services/listClanMembers";
import { handleSetupClan } from "../../services/setupClan";

export async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.commandName === "setup") {
    await handleSetupClan(interaction);
  }

  if (interaction.commandName === "help") {
    await interaction.deferReply();
    await explainCommands(interaction);
  }

  if (interaction.commandName === "clan") {
    await interaction.deferReply();
    await listClanMembers(interaction);
  }

  if (interaction.commandName === "populate") {
    await interaction.deferReply();
    await populateClan(interaction);
  }

  if (interaction.commandName === "scan") {
    await interaction.deferReply();

    await scanClanActivity(interaction);
  }

  if (interaction.commandName === "inactive") {
    const days = interaction.options.getInteger("days") || 30;

    await interaction.deferReply();

    if (isNaN(days) || days < 30) {
      const embed = new EmbedBuilder()
        .setTitle(`Invalid input (number of days)`)
        .setDescription(
          [
            "### Please check the following:",
            "- Number of days must only contain numbers.",
            "- Number of days must not be less than **30**.",
          ].join("\n"),
        )
        .setFooter({ text: "Don't try to break me. I'm fragile 😢" })
        .setColor(0xff0000);

      await interaction.editReply({ embeds: [embed] });

      return;
    }

    await listInactives(interaction, days);
  }

  if (interaction.commandName === "invalid") {
    await interaction.deferReply();
    await listInvalidPlayers(interaction);
  }
}
