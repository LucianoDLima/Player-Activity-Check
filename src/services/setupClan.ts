import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { createClan } from "../db/queries/clan/createClan";
import { findClan } from "../db/queries/clan/findClan";
import { verifyAdminPermissions } from "../util/guardCommands";
import { Clan } from "@prisma/client";

export async function handleSetupClan(interaction: ChatInputCommandInteraction) {
  const isAdmin = await verifyAdminPermissions(interaction);
  if (!isAdmin) return;

  await interaction.deferReply();

  const guildId = interaction.guildId;
  if (!guildId) {
    throw new Error("Interaction doesn' have a guild ID.");
  }

  try {
    const existingClan = await findClan(guildId);
    if (existingClan) {
      interaction.editReply(
        `This server is already set up with the clan: **${existingClan.name}**.`,
      );

      return;
    }

    const clan = await handleClanCreation(interaction, guildId);
    if (!clan) {
      interaction.editReply(
        "An error occurred while setting up the clan. Please check the logs.",
      );

      return;
    }

    const { embed } = buildSuccessEmbed(clan);

    interaction.editReply({
      embeds: [embed],
    });
  } catch (error) {
    console.error("Error during clan setup:", error);

    await interaction.editReply(
      "An error occurred while setting up the clan. Please check the logs.",
    );
  }
}

function handleClanCreation(
  interaction: ChatInputCommandInteraction,
  guildId: string,
) {
  const clanName = interaction.options.getString("clanname", true);

  return createClan(guildId, clanName);
}

function buildSuccessEmbed(clan: Clan) {
  const embedDescription = [
    `Clan **${clan.name}** has been successfully created!`,
    `Please use the following commands to manage your clan:`,
    `- \`/populate\`: Automatically populate the clan with members from your clan.`,
    `- \`/scan\`: Update activity status for all members.`,
    `- \`/inactive\`: List members who have been inactive for a certain number of days.`,
    `- \`/invalid\`: List players who may have private profiles.`,
    `And if you want to learn more about the new commands, run \`/help\`!`,
  ];

  const embed = new EmbedBuilder()
    .setTitle("Clan created!")
    .setDescription(embedDescription.join("\n"));

  return { embed };
}
