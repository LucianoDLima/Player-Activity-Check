import { endpoints } from "../config/endpoints";

interface PlayerActivityInfo {
  lastActivity: string | null;
  lastOnline: string | null;
  isGim: boolean;
  runescapeId: number | null;
}

// Not a scraper, but will leave it here for now as im not sure where to put it

/**
 * Fetch player data from the Runemetrics API.
 *
 * This retrieves the following:
 * - `lastActivity`: The date of their latest tracked activity. Which means if user was online today, but the last trackable activity was last week, it will return last week.
 * - `lastOnline`: The last time they were tracked by the API. TODO: Needs some manual checking to see if it's reliable.
 * - `isGim`: Whether the player is Group Ironman.
 * - `runescapeId`: The player's RuneScape ID. Not sure if this is useful, but my idea is that, maybe, this can be used to track name changes.
 *
 * @param username The RuneScape username to fetch data for.
 */
export async function fetchPlayerData(
  username: string,
): Promise<PlayerActivityInfo | null> {
  try {
    const response = await fetch(`${endpoints.player.RUNEMETRICS_API}${username}`);

    if (!response.ok) {
      console.error(
        `Failed to fetch player data for ${username}:`,
        response.statusText,
      );

      return null;
    }

    const data = await response.json();

    const lastActivity = data.activity?.[0]?.date ?? null;
    const lastOnline = data.lastActivity ?? null;
    const isGim = !!data.groupIronman?.name;
    const runescapeId = data.id ?? null;

    return {
      lastActivity,
      lastOnline,
      isGim,
      runescapeId,
    };
  } catch (error) {
    console.error(`Error fetching player data for ${username}:`, error);
    return null;
  }
}
