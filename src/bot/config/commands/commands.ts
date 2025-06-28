import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

export const commandList = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Explains how to use the bot and its commands."),

  new SlashCommandBuilder()
    .setName("populate")
    .setDescription("Populates the clan with its members."),

  new SlashCommandBuilder()
    .setName("scan")
    .setDescription("Update last tracked activity date for all players."),

  new SlashCommandBuilder()
    .setName("inactive")
    .setDescription("Lists members who have been inactive for a certain period.")
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Number of days to check for inactivity (default: 30)"),
    ),

  new SlashCommandBuilder()
    .setName("invalid")
    .setDescription("Lists players that failed the scan."),

  new SlashCommandBuilder()
    .setName("clan")
    .setDescription("Lists all clan members."),

  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Sets up the clan for this server.")
    .addStringOption((option) =>
      option
        .setName("clanname")
        .setDescription("The name of your clan.")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
];
