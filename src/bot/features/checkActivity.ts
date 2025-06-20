// import { Message } from "discord.js";
// import { formatName } from "../../util/formatNames";
// import { checkPlayerActivity } from "../../scraper/checkPlayerActivity";
// import { calculateDaysSinceLastActivity } from "../../util/formatDate";
// import { findAllPlayers } from "../../db/players";
// import { fetchPlayerSummary } from "./onApi";

/**
 * Moved the logic to scanClanActivity, however this might still be needed.
 * My idea is to first try scanClanActivity, and if it fails, scrape the runemetrics page directly with this function.
 * The scanClanActivity uses their api, which is more reliable and faster, but I hear can be rate limited tho it is very inconsistent.
 */

// export async function checkAllPlayersActivity(message: Message) {
//   try {
//     const allPlayers = await findAllPlayers();

//     const totalMembers = allPlayers.length;
//     const progressMessage = await message.reply(
//       `Checking activity: 0/${totalMembers}`,
//     );
//     message.reply(
//       `Checking all players' activity (${totalMembers} members)... Please wait a moment.`,
//     );

//     let current = 1;

//     for (const member of allPlayers) {
//       try {
//         if (member.isException) {
//           console.log(`Skipping ${member.name} due to rank: ${member.rank}`);
//           current++;

//           continue;
//         }

//         const progressText = `Checking activity: ${current}/${totalMembers} (${member.name})`;
//         await progressMessage.edit(progressText);

//         const formattedName = formatName(member.name);
//         const lastActiveDate = await checkPlayerActivity(formattedName);
//         const daysSinceLastActivity = calculateDaysSinceLastActivity(lastActiveDate);

//         console.log(
//           `${member.name} last active on DB ${daysSinceLastActivity ?? "Never"} days ago`,
//         );

//         if (lastActiveDate) {
//           // await updatePlayerOnlineStatus(member.name, undefined, lastActiveDate);
//           console.log(`Updated ${formattedName} with lastOnline: ${lastActiveDate}`);
//         }
//       } catch (memberError) {
//         console.error(`Error processing ${member.name}:`, memberError);
//       }

//       current++;
//     }
//   } catch (error) {
//     console.error("Error checking all players' activity:", error);
//   }
// }
