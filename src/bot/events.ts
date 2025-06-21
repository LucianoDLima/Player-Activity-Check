import { Client, EmbedBuilder, Message } from "discord.js";
import { populateClan } from "./features/populateClan";
import { getHelpMessage } from "./features/help";
import { listInactives } from "./features/listInactives";
import { findInvalidPlayers, IncludeType } from "./features/findInvalidPlayers";
import { scanClanActivity } from "./features/scanClanActivity";
import { checkAllPlayersActivity } from "./features/checkActivity";
import { consumePendingPlayersList } from "../util/pendingPlayersList";
import { checkExp } from "./features/checkExp";

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

      case "/scan":
        const seconds = args.length > 0 ? parseInt(args[0], 10) : 30;
        const forceSkip = args.includes("--force-skip");

        if (seconds < 15 && !forceSkip) {
          await message.reply({
            embeds: [
              new EmbedBuilder({
                title: `Invalid input (number of seconds)`,
                description: [
                  "### Please check the following:",
                  "- Number of seconds must only contain numbers.",
                  "- Number of seconds must not be less than **15**.",
                ].join("\n"),
                footer: {
                  text: `Don't try to break me. I'm fragile 😢`,
                },
                color: 0xff0000,
                timestamp: new Date(),
              }),
            ],
          });
          return;
        }

        // NOT RELIABLE. Need to remove and just use runemetrics scraping directly.
        await scanClanActivity(message, seconds);
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

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "activity_scan") {
      const playersToScan = consumePendingPlayersList(interaction.message.id);

      if (!playersToScan) {
        await interaction.reply({
          content:
            "This button has expired or the data is no longer available. Please run /inactive command again.",
          ephemeral: true,
        });

        return;
      }

      await interaction.deferReply();

      await checkAllPlayersActivity(interaction, playersToScan);
    }

    if (interaction.customId === "exp_scan") {
      const playersToScan = consumePendingPlayersList(interaction.message.id);

      if (!playersToScan) {
        await interaction.reply({
          content:
            "This button has expired or the data is no longer available. Please run /inactive command again.",
          ephemeral: true,
        });

        return;
      }

      await interaction.deferReply();

      await checkExp(interaction, playersToScan);
    }
  });
}
