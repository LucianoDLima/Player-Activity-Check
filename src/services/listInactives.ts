import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
} from "discord.js";
import { calcDaysSince } from "../util/formatDate";
import { findPlayerByActivity } from "../db/queries/players/findPlayers";
import { setPendingPlayersList } from "../cache/pendingPlayersList";
import { Member } from "@prisma/client";
import { formatBooleanColumn, formatDaysColumn } from "../util/tableFormatter";
import { verifyClanSetup } from "../util/commandGuard";

export async function listInactives(
  interaction: ChatInputCommandInteraction,
  daysThreshold: number = 30,
) {
  try {
    const clan = await verifyClanSetup(interaction);
    if (!clan) return;

    const players = await findPlayerByActivity(clan.guildID);

    // Filter out players who:
    // - Last activity is null (never tracked)
    // - Last activity is less than the days threshold
    // - Monthly exp is true plus Last check is less than the days threshold
    const inactivePlayers = players.filter((player) => {
      const lastActivity = calcDaysSince(player.lastActivity);
      const lastExpCheck = calcDaysSince(player.lastCheckForExpGain);

      const isActivityTooRecent =
        lastActivity === null || lastActivity <= daysThreshold;
      const isExpTooRecent =
        player.hasMonthlyExpGain === true &&
        (lastExpCheck === null || lastExpCheck <= daysThreshold);

      return !isActivityTooRecent && !isExpTooRecent;
    });

    if (inactivePlayers.length === 0) {
      await interaction.editReply(
        `No members have been inactive for more than ${daysThreshold} days.`,
      );

      return;
    }

    const { embed, buttons } = buildInactivesListEmbed(
      inactivePlayers,
      daysThreshold,
    );

    const replyMessage = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
    });

    setPendingPlayersList(replyMessage.id, inactivePlayers);
  } catch (error) {
    console.error("Error in listInactives:", error);

    await interaction.followUp(
      `An error occurred while checking inactive members. Please check the console for details.`,
    );
  }
}

function buildInactivesListEmbed(players: Member[], daysThreshold: number) {
  const WIDTH = {
    ID: 3,
    NAME: 12,
    DAYS: 3,
    BOOL: 3,
  } as const;

  const embedDescription = [
    "```",
    "╒═════╤══════════════╤═════╤═════╤═════╤═════╤═════╕",
    "│  #  │ Player       │ Lst │ Lst │ Mth │ Lst │ is  │",
    "│     │ name         │ act │ chk │ exp │ chk │ gim │",
    "╞═════╪══════════════╪═════╪═════╪═════╪═════╪═════╡",
    ...players.map((member, index) => {
      const id = String(index + 1).padStart(WIDTH.ID);
      const name = member.name.padEnd(WIDTH.NAME);
      const activity = formatDaysColumn(member.lastActivity, WIDTH.DAYS);
      const lstActChk = formatDaysColumn(member.lastCheckForActivity, WIDTH.DAYS);
      const hasMonthExp = formatBooleanColumn(member.hasMonthlyExpGain, WIDTH.BOOL);
      const lastExpCheck = formatDaysColumn(member.lastCheckForExpGain, WIDTH.DAYS);
      const isGim = formatBooleanColumn(member.isGim, WIDTH.BOOL);

      return `│ ${id} │ ${name} │ ${activity} │ ${lstActChk} │ ${hasMonthExp} │ ${lastExpCheck} │ ${isGim} │`;
    }),
    "╘═════╧══════════════╧═════╧═════╧═════╧═════╧═════╛",
    "```",
  ];

  const embed = new EmbedBuilder()
    .setTitle(`Members inactive over ${daysThreshold} days`)
    .setDescription(embedDescription.join("\n"))
    .setColor(0x3498db);

  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("activity_scan")
      .setLabel("Update activity")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("exp_scan")
      .setLabel("Update monthly exp")
      .setStyle(ButtonStyle.Primary),
  );

  return { embed, buttons };
}
