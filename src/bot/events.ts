import { Client, Message } from "discord.js";
import { checkAllPlayersActivity, fetchMembers, inactiveCommand } from "../commands/members";

export function commandsHandler(client: Client) {
  client.on("messageCreate", async (message: Message) => {
    const command = message.content.trim();

    if (command === "!inactive") {
      await inactiveCommand(message);
    }

    // if(command === "!getAll") {
    //   await fetchMembers(message);
    // }

    if(command === "!checkAllPlayers") {
      await checkAllPlayersActivity(message);
    }
  });
}
