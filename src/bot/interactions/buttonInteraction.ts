import { ButtonInteraction } from "discord.js";
import { consumePendingPlayersList } from "../../cache/pendingPlayersList";
import { checkAllPlayersActivity } from "../../services/checkActivity";
import { checkExp } from "../../services/checkExp";
import { handleListClanMembersPagination } from "../../services/listClanMembers";
import { getPendingClanMembers } from "../../cache/pendingClanMembers";

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

  if (interaction.customId.startsWith("clanlist_")) {
    const state = getPendingClanMembers(interaction.message.id);
    if (!state) {
      await interaction.reply({
        content: "This clan list has expired. Please run /clan again.",
        ephemeral: true,
      });

      return;
    }

    await handleListClanMembersPagination(
      interaction,
      state.members,
      state.clanName,
    );
  }
}
