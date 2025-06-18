import prisma from "../prisma/client.prisma";
import { Message } from "discord.js";
import { calculateDaysSinceLastActivity } from "../util/formatDate";

/**
 * List inactive members in the Discord server.
 * The database needs to have been populated with members first, otherwise this will return an empty list.
 *
 * TODO: Maybe I can add a check to see if the database is populated before running this command.
 * or if the prisma.member.findMany finds nothing, I can return a message saying that maybe the db is empty
 *
 * @param message The Discord message object.
 */
export async function listInactives(message: Message) {
  try {
    // Fetch all members who have a lastOnline date and are not on the exception list
    const members = await prisma.member.findMany({
      where: {
        lastOnline: {
          not: null,
        },
        isException: false,
      },
    });

    //
    const inactiveMembers = members.filter((member) => {
      const daysOffline = calculateDaysSinceLastActivity(member.lastOnline);
      return daysOffline! > 30;
    });

    if (inactiveMembers.length === 0) {
      await message.reply("No members have been inactive for more than 30 days.");
      return;
    }

    const result = inactiveMembers
      .map((member) => {
        const daysOffline = calculateDaysSinceLastActivity(member.lastOnline);

        return `**${member.name}** - ${daysOffline} days offline`;
      })
      .join("\n");

    await message.reply(`Members inactive for over 30 days:\n\n${result}`);
  } catch (error) {
    console.error("Error in inactiveCommand:", error);
    await message.reply(
      `An error occurred while checking inactive members.
      ${error}`,
    );
  }
}
