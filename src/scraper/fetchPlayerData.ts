import { endpoints } from "../config/endpoints";

// Not a scraper, but will leave it here for now as im not sure where to put it

interface PlayerData {
  groupIronman: {
    name: string | null;
  };
  id: number | null;
}

/**
 * Fetch player data from the Runepixels API.
 *
 * This retrieves the following:
 * - `isGim`: Whether the player is Group Ironman.
 * - `runescapeId`: The player's RuneScape ID. Not sure if this is useful, but my idea is that, maybe, this can be used to track name changes.
 *
 * @param username The RuneScape username to fetch data for.
 */
export async function fetchPlayerData(username: string) {
  try {
    const response = await fetch(`${endpoints.player.RUNEMETRICS_API}${username}`);

    if (!response.ok) {
      console.error(
        `Failed to fetch player data for ${username}:`,
        response.statusText,
      );

      return null;
    }

    const data: PlayerData = await response.json();

    const isGim = !!data.groupIronman.name;
    const runescapeId = data.id;

    return {
      isGim,
      runescapeId,
    };
  } catch (error) {
    console.error(`Error fetching player data for ${username}:`, error);
    return null;
  }
}
