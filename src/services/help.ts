import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from "discord.js";

const helpPages = [
  [
    "### /populate",
    "Inserts all current clan members into the database",
    "  - Only players not already in the database will be added. (No dupe risk)",
    "  - Only their name and rank will be stored.",
    "- Estimated time: 2 minutes.",

    "",

    "### /scan [argument]",
    "Scans all players in the clan, updating their last time online, last activity, if they are gim, and their runescape ID.",
    "- `/scan <number>`: Sets seconds to wait between each player check.",
    "  - Default is 15 seconds.",
    "  - Must be a number greater than or equal to 15.",
    "- `/scan <number> --force-skip`: Accepts any number below 15.",
    "  - May cause rate limiting issues. Use at your own risk.",
    "- Estimated time: Yes.",
    "  - It depends on how many players are being scanned and how long the wait time is per scan because of rate limits. But it can take upwards of an hour.",

    "",

    "### /inactive [argument]",
    "Lists players inactive for a certain number of days.",
    "- `/inactive <number>`: List all inactive regular players.",
    "  - Default is 30 days and players not on the exception list.",
    "- Estimated time: Immediate.",
  ],
  [
    "### /invalid [argument]",
    "Lists players with no tracked activity. This will either be because they are on the exception list, or because the scanner failed. If too many players on this list, it might cause errors. Check the console if it happens.",
    "- `/invalid`: Only players not on the exception list.",
    "- `/invalid exception`: Only players on the exception list.",
    "- `/invalid both`: All users regardless of exception list.",
    "- Estimated time: Immediate.",
  ],
];

function buildHelpEmbedPage(page: number): {
  embed: EmbedBuilder;
  row: ActionRowBuilder<ButtonBuilder>;
} {
  const embed = new EmbedBuilder({
    title: `Available Commands`,
    description: helpPages[page].join("\n"),
    color: 0x5865f2,
    timestamp: new Date(),
  });

  const row = new ActionRowBuilder<ButtonBuilder>({
    components: [
      new ButtonBuilder({
        custom_id: "prev",
        label: "Previous",
        style: ButtonStyle.Secondary,
        disabled: page === 0,
      }),

      new ButtonBuilder({
        custom_id: "page_info",
        label: `Page ${page + 1}/${helpPages.length}`,
        style: ButtonStyle.Secondary,
        disabled: true,
      }),

      new ButtonBuilder({
        custom_id: "next",
        label: "Next",
        style: ButtonStyle.Primary,
        disabled: page === helpPages.length - 1,
      }),
    ],
  });

  return { embed, row };
}

export async function explainCommands(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  let currentPage = 0;
  let sentMessage: Message | null = null;

  async function updateHelpMessage() {
    const { embed, row } = buildHelpEmbedPage(currentPage);

    if (sentMessage) {
      await sentMessage.edit({ embeds: [embed], components: [row] });
    } else {
      sentMessage = await interaction.editReply({
        embeds: [embed],
        components: [row],
      });
    }
  }

  await updateHelpMessage();

  const collector = sentMessage!.createMessageComponentCollector({
    time: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "next" && currentPage < helpPages.length - 1) {
      currentPage++;
    } else if (interaction.customId === "prev" && currentPage > 0) {
      currentPage--;
    }

    await interaction.deferUpdate();
    await updateHelpMessage();
  });

  collector.on("end", async () => {
    if (sentMessage) {
      await sentMessage.edit({ components: [] });
    }
  });
}
