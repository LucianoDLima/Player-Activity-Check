/**
 * Return true to indicate that the player is is from the staff ranks
 */
export function checkIfStaff(playerRank: string) {
  const staffRanks = [
    "Owner",
    "Deputy Owner",
    "Overseer",
    "Coordinator",
    "Organiser",
    "Admin",
    "General",
  ];

  const isException = staffRanks.includes(playerRank);

  return isException;
}
