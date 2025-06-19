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

    if (include !== "exception") {
      nonExceptionPlayers = await findPlayerWithoutActivity(false);
    }

    if (include === "exception" || include === "both") {
      exceptionPlayers = await findPlayerWithoutActivity(true);
    }

    const nonExceptionPlayersNotFound = nonExceptionPlayers.length === 0;
    const exceptionPlayersNotFound = exceptionPlayers.length === 0;

    if (nonExceptionPlayersNotFound && exceptionPlayersNotFound) {
      await message.reply("No members found with invalid activity data.");

      return;
    }

    const descriptionParts: string[] = [];

    if (nonExceptionPlayers.length > 0) {
      const list = nonExceptionPlayers
        .map((member) => `**${member.name}** - ${member.rank}`)
        .join("\n");

      descriptionParts.push("**Regular rank players:**", list, "");
    }

    if (
      (include === "exception" || include === "both") &&
      exceptionPlayers.length > 0
    ) {
      const list = exceptionPlayers
        .map((member) => `**${member.name}** - ${member.rank}`)
        .join("\n");

      descriptionParts.push("**Players on the exception list:**", list, "");
    }

    await message.reply({
      embeds: [
        new EmbedBuilder({
          title: "Players with no activity recorded",
          description: descriptionParts.join("\n"),
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
