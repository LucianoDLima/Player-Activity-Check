import { Client } from "discord.js";
import { handleInteraction } from "./interactions/interactionHandler";

export function commandsHandler(client: Client) {
  client.on("interactionCreate", async (interaction) => {
    await handleInteraction(interaction);
  });
}
