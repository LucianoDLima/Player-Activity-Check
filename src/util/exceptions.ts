/**
 * Handle exceptions based on player rank
 *
 * @param playerRank - The rank of the player
 */
export function handleIsException(playerRank: string) {
  const exceptionRanks = [
    "Owner",
    "Deputy Owner",
    "Overseer",
    "Coordinator",
    "Organiser",
    "Admin",
    "General",
  ];

  const isException = exceptionRanks.includes(playerRank);

  return isException;
}
