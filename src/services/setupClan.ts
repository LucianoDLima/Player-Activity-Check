import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { createClan } from "../db/queries/clan/createClan";
import { findClan } from "../db/queries/clan/findClan";
import { verifyAdminPermissions } from "../util/guardCommands";
import { Clan } from "@prisma/client";
import { embedCons } from "../constants/embeds";

export async function handleSetupClan(interaction: ChatInputCommandInteraction) {
  const isAdmin = await verifyAdminPermissions(interaction);
  if (!isAdmin) return;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const guildId = interaction.guildId;
  if (!guildId) {
    throw new Error("Interaction doesn't have a guild ID.");
  }

  try {
    const existingClan = await findClan(guildId);
    if (existingClan) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              [
                `This server is already set up with the clan: **${existingClan.name}**.`,
                "\n",
                "If the clan name is incorrect, it will not be able to pull data from the runemetrics.",
                "Please contact the developer as a command to update the name has not been set up yet.",
              ].join("\n"),
            )
            .setColor(embedCons.color.INFO),
        ],
      });

      return;
    }

    const clan = await handleClanCreation(interaction, guildId);

    const { successEmbed } = buildSuccessEmbed(clan);

    await interaction.editReply({
      embeds: [successEmbed],
    });
  } catch (error) {
    console.error("Error during clan setup:", error);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "Something went wrong while setting up the clan. Please send this error to the developer.",
          )
          .setColor(embedCons.color.ERROR),
      ],
    });
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
    '  - This command will take a while. Be patient.',
    `- \`/inactive\`: List members who have been inactive for a certain number of days.`,
    `- \`/invalid\`: List players who may have private profiles.`,
    `And if you want to learn more about the new commands, run \`/help\`!`,
  ];

  const successEmbed = new EmbedBuilder()
    .setTitle("Clan created!")
    .setDescription(embedDescription.join("\n"))
    .setColor(embedCons.color.SUCCCESS);

  return { successEmbed };
}
