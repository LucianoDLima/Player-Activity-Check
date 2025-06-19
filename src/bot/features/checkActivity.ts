import { Message } from "discord.js";
import prisma from "../../prisma/client.prisma";
import { formatName } from "../../util/formatNames";
import { checkPlayerActivity } from "../../scraper/checkPlayerActivity";
import { calculateDaysSinceLastActivity } from "../../util/formatDate";

export async function checkAllPlayersActivity(message: Message) {
  try {
    const allMembers = await prisma.member.findMany({
      orderBy: { id: "asc" },
    });

    const totalMembers = allMembers.length;
    const progressMessage = await message.reply(
      `Checking activity: 0/${totalMembers}`,
    );
    message.reply(
      `Checking all players' activity (${totalMembers} members)... Please wait a moment.`,
    );

    let current = 1;

    for (const member of allMembers) {
      try {
        if (member.isException) {
          console.log(`Skipping ${member.name} due to rank: ${member.rank}`);
          current++;

          continue;
        }

        const progressText = `Checking activity: ${current}/${totalMembers} (${member.name})`;
        await progressMessage.edit(progressText);

        const formattedName = formatName(member.name);
        const lastActiveDate = await checkPlayerActivity(formattedName);
        const daysSinceLastActivity = calculateDaysSinceLastActivity(lastActiveDate);

        console.log(
          `${member.name} last active on DB ${daysSinceLastActivity ?? "Never"} days ago`,
        );

        if (lastActiveDate) {
          await prisma.member.update({
            where: { name: member.name },
            data: { lastOnline: lastActiveDate },
          });
          console.log(`Updated ${formattedName} with lastOnline: ${lastActiveDate}`);
        }
      } catch (memberError) {
        console.error(`Error processing ${member.name}:`, memberError);
      }

      current++;
    }
  } catch (error) {
    console.error("Error checking all players' activity:", error);
  }
}
