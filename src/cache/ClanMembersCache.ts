import { Member } from "@prisma/client";

interface PendingClanMembers {
  members: Member[];
  clanName: string;
}

const pendingClanMembers = new Map<string, PendingClanMembers>();

export function setClanMembersCache(messageId: string, state: PendingClanMembers) {
  pendingClanMembers.set(messageId, state);

  setTimeout(
    () => {
      pendingClanMembers.delete(messageId);
    },
    15 * 60 * 1000,
  );
}

export function getClanMembersCache(messageId: string) {
  const players = pendingClanMembers.get(messageId);

  return players;
}
