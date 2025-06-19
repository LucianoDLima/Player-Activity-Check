import { Client, EmbedBuilder, Message } from "discord.js";
import { populateClan } from "./features/populateClan";
import { getHelpMessage } from "./features/help";
import { listInactives } from "./features/listInactives";
import { checkAllPlayersActivity } from "./features/checkActivity";
import { findInvalidPlayers, IncludeType } from "./features/findInvalidPlayers";

export function commandsHandler(client: Client) {
  client.on("messageCreate", async (message: Message) => {
    const [command, ...args] = message.content.trim().split(" ");

    switch (command) {
      case "/help":
        await getHelpMessage(message);
        break;

      case "/populate":
        await populateClan(message);
        break;

      case "/inactive":
        const days = args.length > 0 ? parseInt(args[0], 10) : 30;

        if (isNaN(days) || days < 30) {
          const embed = new EmbedBuilder({
            title: `Invalid input (number of days)`,
            description: [
              "### Please check the following:",
              "- Number of days must only contain numbers.",
              "- Number of days must not be less than **30**.",
            ].join("\n"),
            footer: {
              text: `Don't try to break me. I'm fragile 😢`,
            },
            color: 0xff0000,
            timestamp: new Date(),
          });

          await message.reply({ embeds: [embed] });
          break;
        }

        await listInactives(message, days);
        break;

      case "/checkAllPlayers":
        await checkAllPlayersActivity(message);
        break;

      case "/invalid":
        let include: IncludeType | undefined = undefined;

        if (args[0] === "both") {
          include = "both";
        } else if (args[0] === "exception") {
          include = "exception";
        }

        await findInvalidPlayers(message, include);
        break;

      case "/purge":
        // TODO: Implement purge function. It will remove members who are not in the clan anymore.
        break;
    }
  });
}
