import {
  EmbedBuilder,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { calculateDaysSinceLastActivity } from "../../util/formatDate";
import { findPlayerByActivity } from "../../db/players";
import { setPendingPlayersList } from "../../util/pendingPlayersList";

/**
 * List players inactive for a certain number of days.
 *
 * @param message The discord bot message that will be sent.
 */
export async function listInactives(message: Message, daysThreshold: number = 30) {
  try {
    const players = await findPlayerByActivity();

    // Find players whose days offline exceeds the days threshold
    const inactivePlayers = players.filter((player) => {
      const lastActivity = calculateDaysSinceLastActivity(player.lastActivity);

      return lastActivity! > daysThreshold;
    });

    // If empty array is returned, then it means no players have been inactive for the days threshold
    if (inactivePlayers.length === 0) {
      await message.reply(
        `No members have been inactive for more than ${daysThreshold} days.`,
      );

      return;
    }

    // Return all inactive players with how many days theyve been offline and desc sort it
    const inactivePlayersList = [
      "```",
      "| id  | Player       | last | mnth | last | is   |",
      "|     | name         | actv | exp  | chek | gim  |",
      "| --- | ------------ | ---- | ---- | ---- | ---- |",
      ...inactivePlayers
        .map((member) => ({
          name: member.name,
          lastActivity: calculateDaysSinceLastActivity(member.lastActivity),
          lastCheck: calculateDaysSinceLastActivity(member.updatedAt),
          isGim: member.isGim,
          id: member.id,
        }))
        .map((member, index) => {
          const id = String(index + 1).padStart(3, " ");
          const name = member.name.padEnd(12).slice(0, 15);
          const activity = String(member.lastActivity).padStart(4).slice(0, 4);
          const isGim = member.isGim ? "yes " : "no  ";
          const lastCheck = String(member.lastCheck).padStart(4).slice(0, 4);
          return `| ${id} | ${name} | ${activity} |      | ${lastCheck} | ${isGim} |`;
        }),
      "```",
    ].join("\n");

    const replyMessage = await message.reply({
      embeds: [
        new EmbedBuilder({
          title: `Members inactive over ${daysThreshold} days`,
          description: inactivePlayersList,
          footer: {
            text: `Total inactive members: ${inactivePlayers.length}`,
          },
          color: 0xff0000,
          timestamp: new Date(),
        }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              custom_id: "deep_scan",
              label: "Update activity",
              style: ButtonStyle.Primary,
            }),
          ],
        }),
      ],
    });

    setPendingPlayersList(replyMessage.id, inactivePlayers);
  } catch (error) {
    console.error("Error in listInactives:", error);

    await message.reply(
      `An error occurred while checking inactive members.
      ${error}`,
    );
  }
}
