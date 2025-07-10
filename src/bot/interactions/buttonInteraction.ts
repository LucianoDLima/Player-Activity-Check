import { ButtonInteraction, MessageFlags } from "discord.js";
import { handleActivityScan } from "../../services/activityScan";
import { handleListClanMembersPagination } from "../../services/listClanMembers";
import { getClanMembersCache } from "../../cache/ClanMembersCache";
import { handleMonthlyExpScan } from "../../services/monthlyExpScan";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  if (interaction.customId === "activity_scan") {
    const playersToScan = getClanMembersCache(interaction.message.id);

    if (!playersToScan) {
      await interaction.reply({
        content: "This button has expired or the data is no longer available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();
    await handleActivityScan(interaction, playersToScan.members);
  }

  if (interaction.customId === "exp_scan") {
    const playersToScan = getClanMembersCache(interaction.message.id);

    if (!playersToScan) {
      await interaction.reply({
        content: "This button has expired or the data is no longer available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();
    await handleMonthlyExpScan(interaction, playersToScan.members);
  }

  if (interaction.customId.startsWith("clanlist_")) {
    const state = getClanMembersCache(interaction.message.id);
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
