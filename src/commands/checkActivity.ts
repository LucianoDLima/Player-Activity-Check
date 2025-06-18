import { Message } from "discord.js";
import prisma from "../prisma/client.prisma";
import { formatName } from "../util/formatNames";
import { checkPlayerActivity } from "../scraper/checkPlayerActivity";
import { calculateDaysSinceLastActivity } from "../util/formatDate";

export async function checkAllPlayersActivity(message: Message) {
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
    if (member.isException) {
      console.log(`Skipping ${member.name} due to rank: ${member.rank}`);
      current++;
      continue;
    }
    const progressText = `Checking activity: ${current}/${totalMembers} (${member.name})`;
    await progressMessage.edit(progressText);

    console.log(`Member.name: ${member.name}`);

    const formattedName = formatName(member.name);

    const lastActiveDate = await checkPlayerActivity(formattedName);

    const daysSinceLastActivity = calculateDaysSinceLastActivity(lastActiveDate);
    console.log(
      `${member.name} last active on DB ${daysSinceLastActivity ?? "Never"} days ago`,
    );

    const found = await prisma.member.findFirst({
      where: { name: member.name },
    });

    console.log("found:", found?.name);
    if (lastActiveDate) {
      await prisma.member.update({
        where: { name: member.name },
        data: {
          lastOnline: lastActiveDate,
        },
      });
      console.log(`Updated ${formattedName} with lastOnline: ${lastActiveDate}`);
    }
    current++;
  }
}
