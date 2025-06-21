import { EmbedBuilder, Message } from "discord.js";
import { findPlayerWithoutActivity } from "../../db/players";
import { Member } from "@prisma/client";

export type IncludeType = "both" | "exception";

/**
 * Find players with lastOnline null.
 * This will most likely be players that either the scraping failed, or have privacy on runemtrics.
 * It also includes players on the exception list if their activity have never been tracked.
 *
 * @param message Message that will be sent through discord bot
 * @param include Type of players to be returned
 */
export async function findInvalidPlayers(message: Message, include?: IncludeType) {
  try {
    let nonExceptionPlayers: Member[] = [];
    let exceptionPlayers: Member[] = [];
    let playersList: Member[] = [];

    if (include !== "exception") {
      nonExceptionPlayers = await findPlayerWithoutActivity(false);
      playersList.push(...nonExceptionPlayers);
    }

    if (include === "exception" || include === "both") {
      exceptionPlayers = await findPlayerWithoutActivity(true);
      playersList.push(...exceptionPlayers);
    }

    const nonExceptionPlayersNotFound = nonExceptionPlayers.length === 0;
    const exceptionPlayersNotFound = exceptionPlayers.length === 0;

    if (nonExceptionPlayersNotFound && exceptionPlayersNotFound) {
      await message.reply("No members found with invalid activity data.");

      return;
    }

    const descriptionParts = [
      "``` ",
      "Player          | rank | xcep |",
      "                |      | tion |",
      "--------------- | ---- | ---- |",
      ...playersList
        .map((member) => ({
          name: member.name,
          rank: member.rank,
          exception: member.isException ? "yes" : "no",
        })) // TODO: Sort rank by runescape hierarchy or add a button to change sorting idk yet
        .sort((a, b) => a.rank!.localeCompare(b.rank!))
        .map((member) => {
          const name = member.name.padEnd(15).slice(0, 15);
          const rank = member.rank!.padEnd(4).slice(0, 4);
          const exception = member.exception.padEnd(4).slice(0, 4);
          return `${name} | ${rank} | ${exception} |`;
        }),
      "```",
    ].join("\n");

    await message.reply({
      embeds: [
        new EmbedBuilder({
          title: "Players with no activity recorded",
          description: descriptionParts,
          color: 0xff0000,
          timestamp: new Date(),
        }),
      ],
    });
  } catch (error) {
    console.error("Error in findInvalidPlayers:", error);

    await message.reply(`An error occurred while finding invalid players. ${error}`);
  }
}
