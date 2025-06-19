import prisma from "../../prisma/client.prisma";
import { EmbedBuilder, Message } from "discord.js";
import { calculateDaysSinceLastActivity } from "../../util/formatDate";

/**
 * List players inactive for a certain number of days.
 *
 * @param message The discord bot message that will be sent.
 */
export async function listInactives(message: Message, daysThreshold: number = 30) {
  try {
    const players = await prisma.member.findMany({
      where: {
        lastOnline: {
          not: null,
        },
        isException: false,
      },
    });

    // Find players whose days offline exceeds the days threshold
    const inactivePlayers = players.filter((player) => {
      const daysOffline = calculateDaysSinceLastActivity(player.lastOnline);

      return daysOffline! > daysThreshold;
    });

    // If empty array is returned, then it means no players have been inactive for the days threshold
    if (inactivePlayers.length === 0) {
      await message.reply(
        `No members have been inactive for more than ${daysThreshold} days.`,
      );

      return;
    }

    // Return all inactive players with how many days theyve been offline and desc sort it
    const inactivePlayersList = inactivePlayers
      .map((member) => ({
        name: member.name,
        daysOffline: calculateDaysSinceLastActivity(member.lastOnline),
      }))
      .sort((a, b) => b.daysOffline! - a.daysOffline!)
      .map((member) => `**${member.name}** - ${member.daysOffline} days offline`)
      .join("\n");

    await message.reply({
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
    });
  } catch (error) {
    console.error("Error in listInactives:", error);

    await message.reply(
      `An error occurred while checking inactive members.
      ${error}`,
    );
  }
}
