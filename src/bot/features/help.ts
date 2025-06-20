import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
} from "discord.js";

const helpPages: string[][] = [
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

export async function getHelpMessage(message: Message) {
  let currentPage = 0;

  async function updateHelpMessage() {
    const embed = new EmbedBuilder()
      .setTitle(`Available Commands`)
      .setDescription(helpPages[currentPage].join("\n"))
      .setColor(0x5865f2)
      .setTimestamp(new Date());

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️ Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0),

      new ButtonBuilder()
        .setCustomId("page_info")
        .setLabel(`Page ${currentPage + 1}/${helpPages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),

      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next ➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === helpPages.length - 1),
    );

    if (sentMessage) {
      await sentMessage.edit({ embeds: [embed], components: [row] });
    } else {
      sentMessage = await message.reply({ embeds: [embed], components: [row] });
    }
  }

  let sentMessage: Message | null = null;
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
