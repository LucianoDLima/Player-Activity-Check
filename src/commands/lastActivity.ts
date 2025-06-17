import { Message, AttachmentBuilder } from "discord.js";
import { getLatestActivityDate } from "../scraper/getLastActivity";
import { getListOfMembers } from "../scraper/getListOfMembers";
import { scrapeHiscorePage } from "../scraper/getListOfMembersOfficial";
import prisma from "../prisma/client.prisma";

export async function handleLastActivity(message: string) {
  // message.reply('Fetching the latest activity date... Please wait a moment.');

  // const latestActivity = await getLatestActivityDate('SwaggyKat');
  // const members = await getListOfMembers();
  const members = await scrapeHiscorePage(1);

  console.log("Members array:", members);

  const clan = await prisma.clan.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: "Iron Rivals",
    },
  });

  for (const name of members) {
    const existing = await prisma.member.findUnique({
      where: { name },
    });

    if (existing) {
      console.log(`Skipping duplicate: ${name}`);
      continue;
    }

    try {
      await prisma.member.create({
        data: {
          name,
          clanId: clan.id,
        },
      });
      console.log(`Inserted: ${name}`);
    } catch (error) {
      console.error(`Failed to insert ${name}:`, error);
    }
  }

  // if (members.length === 0) {
  //   await message.reply('No members found.');
  // } else {
  //   await message.reply(members.join('\n'));
  // }

  // message.reply(members as any);
}
