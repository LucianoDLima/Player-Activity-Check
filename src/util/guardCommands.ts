import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import { findClan } from "../db/queries/clan/findClan";

/**
 * Check if a clan has been set up for the server.
 * If so,return the clan object.
 */
export async function verifyClanSetup(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
) {
  const guildID = interaction.guildId;

  if (guildID === null) {
    throw new Error("Interaction does not have a guild ID.");
  }

  const clan = await findClan(guildID);

  if (!clan) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content:
          "This server has not been set up yet. An administrator must run `/setup` first.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          "This server has not been set up yet. An administrator must run `/setup` first.",
        ephemeral: true,
      });
    }

    return null;
  }

  return clan;
}

/**
 * Make sure only members with admin perms can run a command.
 */
export async function verifyAdminPermissions(
  interaction: ChatInputCommandInteraction,
) {
  const isAdmin = interaction.memberPermissions?.has(
    PermissionsBitField.Flags.Administrator,
  );

  if (!isAdmin) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "You must be an administrator to run this command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "You must be an administrator to run this command.",
        ephemeral: true,
      });
    }

    return false;
  }

  return true;
}
