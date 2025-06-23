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

    // Filter out players who:
    // - Last activity is null (never tracked)
    // - Last activity is less than the days threshold
    // - Monthly exp is true plus Last check (updatedAt) is more than the days threshold
    const inactivePlayers = players.filter((player) => {
      const lastActivity = calculateDaysSinceLastActivity(player.lastActivity);
      const lastCheck = calculateDaysSinceLastActivity(player.updatedAt);

      const isActivityTooRecent =
        lastActivity === null || lastActivity <= daysThreshold;
      const isExpTooRecent =
        player.hasMonthlyExpGain === true &&
        (lastCheck === null || lastCheck <= daysThreshold);

      return !isActivityTooRecent && !isExpTooRecent;
    });

    // If empty array is returned, then it means no players have been inactive for the days threshold
    if (inactivePlayers.length === 0) {
      await message.reply(
        `No members have been inactive for more than ${daysThreshold} days.`,
      );

      return;
    }

    // Return all inactive players with how many days theyve been offline, if they got any exp this month, and if they are a GIM
    // last chek is the last time this user has been updated. Makes it easier to see if the monthly exp gain is relevant or not.
    const inactivePlayersList = [
      "```",
      "╒═════╤══════════════╤═════╤═════╤═════╤═════╤═════╕",
      "│  #  │ Player       │ Lst │ Lst │ Mth │ Lst │ is  │",
      "│     │ name         │ act │ chk │ exp │ chk │ gim │",
      "╞═════╪══════════════╪═════╪═════╪═════╪═════╪═════╡",
      ...inactivePlayers.map((member, index) => {
        const id = String(index + 1).padStart(3, " ");
        const name = member.name.padEnd(12).slice(0, 15);
        const activity = String(calculateDaysSinceLastActivity(member.lastActivity))
          .padStart(3)
          .slice(0, 3);
        const lastActivityCheck =
          calculateDaysSinceLastActivity(member.lastCheckForActivity) === null
            ? "   "
            : String(
                calculateDaysSinceLastActivity(member.lastCheckForActivity),
              ).padStart(3);
        const lastExpCheck =
          calculateDaysSinceLastActivity(member.lastCheckForExpGain) === null
            ? "   "
            : String(
                calculateDaysSinceLastActivity(member.lastCheckForExpGain),
              ).padStart(3);
        const hasMonthExp =
          member.hasMonthlyExpGain === null
            ? "   "
            : member.hasMonthlyExpGain
              ? "yes"
              : "no ";
        const isGim = member.isGim === null ? "    " : member.isGim ? "yes" : "no ";

        return `│ ${id} │ ${name} │ ${activity} │ ${lastActivityCheck} │ ${hasMonthExp} │ ${lastExpCheck} │ ${isGim} │`;
      }),
      "╘═════╧══════════════╧═════╧═════╧═════╧═════╧═════╛",
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
              custom_id: "activity_scan",
              label: "Update activity",
              style: ButtonStyle.Primary,
            }),
            new ButtonBuilder({
              custom_id: "exp_scan",
              label: "Update monthly exp",
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
