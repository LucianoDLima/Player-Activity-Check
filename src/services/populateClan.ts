import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { verifyClanSetup } from "../util/guardCommands";
import { endpoints } from "../constants/endpoints";
import { findManyPlayers } from "../db/queries/players/findPlayers";
import { createPlayers } from "../db/queries/players/createPlayers";
import { Clan } from "@prisma/client";
import { embedCons } from "../constants/embeds";

export async function populateClan(interaction: ChatInputCommandInteraction) {
  try {
    const clan = await verifyClanSetup(interaction);
    if (!clan) return;

    await interaction.deferReply();

    const data = await parseClanMembersData(clan);

    const { id: clanId } = clan;
    const { members } = data;

    const existingMembers = await findManyPlayers(clanId);
    const existingMemberNames = new Set(
      existingMembers.map((member) => member.name),
    );

    const newMembers = members
      .filter((member) => !existingMemberNames.has(member.name))
      .map((member) => ({
        name: member.name,
        rank: member.rank,
        clanId: clanId,
      }));

    if (newMembers.length === 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription(`No new members to add to **${clan.name}**.`)
            .setColor(embedCons.color.INFO),
        ],
      });

      return;
    }

    const created = await createPlayers(newMembers);

    const { successEmbed } = buildSuccessEmbed(created.count);

    await interaction.editReply({
      embeds: [successEmbed],
    });
  } catch (error) {
    console.error("Error populating clan:", error);

    await interaction.editReply(`Error populating clan.`);
  }
}

async function fetchClanMembersData(clanName: string) {
  const formattedName = clanName.replace(/ /g, "+");
  const hiscoresUrl = `${endpoints.clan.MEMBERS}${formattedName}`;
  const response = await fetch(hiscoresUrl);

  const data = await response.text();

  const redirectedUrl = data.includes("<title>");
  if (redirectedUrl) {
    return;
  }

  return data;
}

export async function parseClanMembersData(clan: Clan) {
  const clanData = await fetchClanMembersData(clan.name);

  if (!clanData) {
    throw new Error("No data received from clan hiscores.");
  }

  const members = clanData
    .split("\n")
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [name, rank] = line.split(",");
      return {
        name: name.replace(/�/g, " "),
        rank,
      };
    });

  return { members };
}

function buildSuccessEmbed(members: number) {
  const embedDescription = [
    `Clan has been successfully populated with **${members} members**!`,
    `You can now run \`/scan\` to update their activity.`,
  ];

  const successEmbed = new EmbedBuilder()
    .setTitle("Clan Population Success")
    .setDescription(embedDescription.join("\n"))
    .setColor(embedCons.color.SUCCCESS);

  return { successEmbed };
}
