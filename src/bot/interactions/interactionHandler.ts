import { Interaction } from "discord.js";
import { handleChatInputCommand } from "./chatCommands";
import { handleButtonInteraction } from "./buttonInteraction";

export async function handleInteraction(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    await handleChatInputCommand(interaction);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  }
}
