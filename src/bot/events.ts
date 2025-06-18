import { Client, Message } from "discord.js";
import { populateClan } from "../commands/populateClan";
import { getHelpMessage } from "../commands/help";
import { listInactives } from "../commands/listInactives";
import { checkAllPlayersActivity } from "../commands/checkActivity";

export function commandsHandler(client: Client) {
  client.on("messageCreate", async (message: Message) => {
    const command = message.content.trim();

    if (command === "!help") {
      await getHelpMessage(message);
    }

    if (command === "!populate") {
      await populateClan(message);
    }

    if (command === "!inactive") {
      await listInactives(message);
    }

    if (command === "!checkAllPlayers") {
      await checkAllPlayersActivity(message);
    }

    if (command === "!purge") {
      // TODO: Implement purge function. It will remove members who are not in the clan anymore.
      // await purgeMembers();
    }
  });
}
