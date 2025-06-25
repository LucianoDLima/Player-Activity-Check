import { ButtonInteraction } from "discord.js";
import { consumePendingPlayersList } from "../../cache/pendingPlayersList";
import { checkAllPlayersActivity } from "../../services/checkActivity";
import { checkExp } from "../../services/checkExp";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  if (interaction.customId === "activity_scan") {
    const playersToScan = consumePendingPlayersList(interaction.message.id);

    if (!playersToScan) {
      await interaction.reply({
        content: "This button has expired or the data is no longer available.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    await checkAllPlayersActivity(interaction, playersToScan);
  }

  if (interaction.customId === "exp_scan") {
    const playersToScan = consumePendingPlayersList(interaction.message.id);

    if (!playersToScan) {
      await interaction.reply({
        content: "This button has expired or the data is no longer available.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();
    await checkExp(interaction, playersToScan);
  }
}
