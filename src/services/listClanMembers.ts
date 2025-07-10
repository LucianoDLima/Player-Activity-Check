import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonInteraction,
  MessageFlags,
} from "discord.js";
import { setClanMembersCache } from "../cache/ClanMembersCache";
import { findAllPlayers } from "../db/queries/players/findPlayers";
import { Member } from "@prisma/client";
import { formatDaysColumn } from "../util/tableFormatter";
import { verifyClanSetup } from "../util/guardCommands";

export async function listClanMembers(interaction: ChatInputCommandInteraction) {
  try {
    const clan = await verifyClanSetup(interaction);
    if (!clan) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const allPlayers = await findAllPlayers(clan.guildID);

    if (allPlayers.length === 0) {
      await interaction.editReply(`Could not find any members for ${clan.name}.`);

      throw new Error(
        `No members found for clan: ${clan.name}. Please check the database.`,
      );
    }

    const players = allPlayers;

    const { embed, buttons } = buildClanListEmbed(players, 0, clan.name);

    const replyMessage = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
    });

    setClanMembersCache(replyMessage.id, {
      members: players,
      clanName: clan.name,
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      "An error occurred while fetching clan members. Please check the logs.",
    );
  }
}

// TODO: I think i can make this reusable for when I want to paginate other lists
export async function handleListClanMembersPagination(
  interaction: ButtonInteraction,
  members: Member[],
  clanName: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, direction, currentPageStr] = interaction.customId.split("_");
  const currentPage = parseInt(currentPageStr, 10);
  const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
  const { embed, buttons } = buildClanListEmbed(members, nextPage, clanName);

  await interaction.update({ embeds: [embed], components: [buttons] });
}

function buildClanListEmbed(
  members: Member[],
  currentPage: number,
  clanName: string,
) {
  const itemsPerPage = 20;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const page = Math.max(0, Math.min(currentPage, totalPages - 1));
  const WIDTH = {
    number: 3,
    name: 12,
    rank: 6,
    days: 3,
    inactive: 10,
  } as const;

  const first = page * itemsPerPage;
  const last = first + itemsPerPage;
  const pageMembers = members.slice(first, last);

  const embedDescription = [
    "```",
    "╒═════╤══════════════╤════════╤════════════╕",
    "│  #  │ Player       │ rank   │ inactive   │",
    "╞═════╪══════════════╪════════╪════════════╡",
    ...pageMembers.map((member, index) => {
      const number = String(first + index + 1).padStart(WIDTH.number);
      const name = member.name.padEnd(WIDTH.name);
      const rank = member.rank!.padEnd(WIDTH.rank).slice(0, WIDTH.rank);
      const days = formatDaysColumn(member.lastActivity, WIDTH.days);
      const inactive =
        days !== " ".repeat(WIDTH.days)
          ? `${days} day(s)`.padEnd(WIDTH.inactive)
          : "Unavailable".padEnd(WIDTH.inactive).slice(0, WIDTH.inactive);

      return `│ ${number} │ ${name} │ ${rank} │ ${inactive} │`;
    }),
    "╘═════╧══════════════╧════════╧════════════╛",
    "```",
  ];

  const embed = new EmbedBuilder()
    .setTitle(`Clan members: ${clanName}`)
    .setDescription(embedDescription.join("\n"))
    .setColor(0x3498db);

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`clanlist_prev_${page}`)
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),

    new ButtonBuilder()
      .setCustomId("page_info")
      .setDisabled(true)
      .setLabel(`${page + 1}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`clanlist_next_${page}`)
      .setLabel("Next")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1),
  );

  return { embed, buttons };
}
