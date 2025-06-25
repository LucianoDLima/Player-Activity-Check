// TODO: This is basically the same as pendingPlayersList.ts, but this one is better since it has their clan name as a property.
// I need to remove the other and refactor so the other functions using it can use this one instead for when multiple calns are supported.
import { ClanMemberData } from "../services/listClanMembers";

interface PendingClanMembers {
  members: ClanMemberData[];
  clanName: string;
}

const pendingClanMembers = new Map<string, PendingClanMembers>();

export function setPendingClanMembers(messageId: string, state: PendingClanMembers) {
  pendingClanMembers.set(messageId, state);

  setTimeout(
    () => {
      pendingClanMembers.delete(messageId);
    },
    10 * 60 * 1000,
  );
}

export function getPendingClanMembers(messageId: string) {
  return pendingClanMembers.get(messageId);
}
