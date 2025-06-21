import { Member } from "@prisma/client";

// Stores the list of inactive players. The disc msg id  will be the key, and the arr of players will be the value
const pendingPlayersList = new Map<string, Member[]>();

/**
 * Works as a state manager
 * it saves the list of players returned by a function so it can be used in another function that will also need that list as a follow up.
 *
 * @param messageId The disc message ID that will be used as a key to store the list of players
 * @param players The list of players
 */
export function setPendingPlayersList(messageId: string, players: Member[]) {
  pendingPlayersList.set(messageId, players);

  // Clean up the entry after 4 mins cz bad computer :p in case too many are called
  setTimeout(
    () => {
      pendingPlayersList.delete(messageId);
      console.log(`Cleaned up expired pending scan for message: ${messageId}`);
    },
    4 * 60 * 1000,
  );
}

/**
 * It retriesves the list of players stored in the pendingPlayersList and deletes it after to avoid memory leaks
 * @param messageId The disc message ID that will be used as a key to store the list of players
 */
export function consumePendingPlayersList(messageId: string): Member[] | undefined {
  const players = pendingPlayersList.get(messageId);
  // if (players) {
  //   pendingPlayersList.delete(messageId);
  // }

  return players;
}
