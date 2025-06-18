import { Message } from "discord.js";

export async function getHelpMessage(message: Message) {
  message.reply(`
## Available Commands:
1. **!populate** - Add all current players to the activity check list.
2. **!inactive** - Check for inactive players.
3. **!checkAllPlayers** - Check activity for all players.`);
}
