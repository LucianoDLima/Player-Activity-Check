import { Message, AttachmentBuilder } from "discord.js";
import { getLatestActivityDate } from "../scraper/getLastActivity";
import { getListOfMembers } from "../scraper/getListOfMembers";
import {
  checkNumberOfPages,
  scrapeHiscorePage,
} from "../scraper/getListOfMembersOfficial";
import prisma from "../prisma/client.prisma";
import { checkPlayerActivity } from "../scraper/checkPlayerActivity";
import { formatName } from "../util/formatNames";
import { calculateDaysSinceLastActivity } from "../util/formatDate";

export async function fetchMembers() {
  // message.reply('Fetching the latest activity date... Please wait a moment.');

  const numberOfPages = await checkNumberOfPages();

  const clan = await prisma.clan.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: "Iron Rivals",
    },
  });

  for (let page = 1; page <= numberOfPages; page++) {
    const members = (await scrapeHiscorePage(page)).slice(1);

    for (const member of members) {
      const existing = await prisma.member.findUnique({
        where: { name: member.name },
      });

      if (existing) {
        console.log(`Skipping duplicate: ${member.name}`);
        continue;
      }

      const exceptionRanks = [
        "Owner",
        "Deputy Owner",
        "Overseer",
        "Coordinator",
        "Organiser",
        "Admin",
        "General",
      ];

      const isException = exceptionRanks.includes(member.rank);

      try {
        await prisma.member.create({
          data: {
            name: member.name,
            rank: member.rank,
            clanId: clan.id,
            isException,
          },
        });
        console.log(`Inserted: ${member.name} - ${member.rank}`);
      } catch (error) {
        console.error(`Failed to insert ${member.name}:`, error);
      }
    }
  }

  // message.reply(members as any);
}

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
          daysOffline: daysSinceLastActivity ?? null,
        },
      });
      console.log(`Updated ${formattedName} with lastOnline: ${lastActiveDate}`);
    }
    current++;
  }
}

export async function inactiveCommand(message: Message) {
  const members = await prisma.member.findMany({
    where: {
      lastOnline: {
        not: null,
      },
      isException: false,
    },
  });

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
}
