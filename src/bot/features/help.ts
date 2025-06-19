import { Message } from "discord.js";
import { EmbedBuilder } from "discord.js";

// TODO: Explain better and use embed
export async function getHelpMessage(message: Message) {
  await message.reply({
    embeds: [
      new EmbedBuilder({
        title: "Available commands",
        description: [
          "### /populate",
          "Insert all current players into the database. This only fetches players' names and ranks.",
          "Make sure to use [TODO: Purge command] to remove users that are no longer in the clan.",
          "  - Time estimate: 2 minutes",
          "### /checkAllPlayers",
          "Get all players from the database and check their activity on runemetrics one by one",
          "Some players are very likely to fail this check, either because they have privacy turned on, or the information didn't load in time",
          "Make sure to use the [TODO: IMPLEMENT FUNCTION TO FETCH AGAIN ONLY FAILED USERS] command for these users",
          "  - Time estimate: 30 to 50 minutes. It depends on how many members are in the clan.",
          "### /inactive <(any number over 30) || update>",
          "- */inactive*: Finds the players who have been inactive over 30 days as default if left empty;",
          "- */inactive <any number over 30>*: Finds the players who have been inactive over this amount of days;",
          "- TODO: */inactive update*: Finds the players who have been inactive over the amount of days you input and update it with the runemetrics value.",
          "  - Time estimate (days): Immediate",
          "  - Time estimate (update): 5 to 15 minutes. It depends on how many players are on the inactive list.",
          "### /invalid <exception || both>",
          "Get all the players that didn't have their activity tracked. Either because of an error or privacy on.",
          "- */invalid*: Finds the regular players. They are not the exception list;",
          "- */invalid exception*: Finds only the players who are on the exception list;",
          "- */invalid both*: Finds both regular and exception players;",
          "  - Time estimate: Immediate",
        ].join("\n"),
        timestamp: new Date(),
        color: 0x5865f2,
      }),
    ],
  });
}
