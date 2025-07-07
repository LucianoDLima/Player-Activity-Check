import { ButtonInteraction, MessageFlags } from "discord.js";
import { consumePendingPlayersList } from "../../cache/pendingPlayersList";
import { handleActivityScan } from "../../services/activityScan";
import { handleListClanMembersPagination } from "../../services/listClanMembers";
import { getPendingClanMembers } from "../../cache/pendingClanMembers";
import { handleMonthlyExpScan } from "../../services/monthlyExpScan";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  if (interaction.customId === "activity_scan") {
    const playersToScan = consumePendingPlayersList(interaction.message.id);

    if (!playersToScan) {
      await interaction.reply({
        content: "This button has expired or the data is no longer available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();
    await handleActivityScan(interaction, playersToScan);
  }

  if (interaction.customId === "exp_scan") {
    const playersToScan = consumePendingPlayersList(interaction.message.id);

    if (!playersToScan) {
      await interaction.reply({
        content: "This button has expired or the data is no longer available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();
    await handleMonthlyExpScan(interaction, playersToScan);
  }

  if (interaction.customId.startsWith("clanlist_")) {
    const state = getPendingClanMembers(interaction.message.id);
    if (!state) {
      await interaction.reply({
        content: "This clan list has expired. Please run /clan again.",
        flags: MessageFlags.Ephemeral,
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
