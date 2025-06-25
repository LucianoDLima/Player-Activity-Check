// TODO: See pendingClanMembers.ts' TODO. Need to delete this one
import { Member } from "@prisma/client";

const pendingPlayersList = new Map<string, Member[]>();

export function setPendingPlayersList(messageId: string, players: Member[]) {
  pendingPlayersList.set(messageId, players);

  setTimeout(
    () => {
      pendingPlayersList.delete(messageId);
      console.log(`Cleaned up expired pending scan for message: ${messageId}`);
    },
    10 * 60 * 1000,
  );
}

export function consumePendingPlayersList(messageId: string): Member[] | undefined {
  const players = pendingPlayersList.get(messageId);
  // TODO: It should delete, but I use it in two differente instances. Need to figure out if its ok to leave it like this.
  // if (players) {
  //   pendingPlayersList.delete(messageId);
  // }

  return players;
}
