/**
 * Utility functions for gender-related operations
 */

export type Gender = "MALE" | "FEMALE" | "NON_BINARY" | null;

export interface GenderStats {
  averageRating: number | null;
  playerCount: number;
  percentage: number;
}

export interface PlayerStatistics {
  male: GenderStats;
  female: GenderStats;
  nonBinary: GenderStats;
  unspecified: GenderStats;
  totalPlayers: number;
}

export interface PlayerWithRatings {
  id: number;
  name: string;
  gender: string | null;
  seasons: {
    rank: number | null;
  }[];
}

/**
 * Get human-readable gender label
 */
export function getGenderLabel(gender: string | null): string {
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "NON_BINARY":
      return "Non-Binary";
    default:
      return "Gender not set";
  }
}

/**
 * Get gender filter counts for display
 */
export function getGenderCounts(players: PlayerWithRatings[]) {
  return {
    all: players.length,
    male: players.filter((p) => p.gender === "MALE").length,
    female: players.filter((p) => p.gender === "FEMALE").length,
    nonBinary: players.filter((p) => p.gender === "NON_BINARY").length,
    unspecified: players.filter((p) => p.gender === null).length,
  };
}

/**
 * Calculate comprehensive player statistics by gender
 */
export function calculatePlayerStatistics(
  players: PlayerWithRatings[]
): PlayerStatistics {
  const totalPlayers = players.length;

  // Group players by gender
  const genderGroups = {
    male: { ratings: [] as number[], count: 0 },
    female: { ratings: [] as number[], count: 0 },
    nonBinary: { ratings: [] as number[], count: 0 },
    unspecified: { ratings: [] as number[], count: 0 },
  };

  players.forEach((player) => {
    // Calculate average rating for this player
    const rankedSeasons = player.seasons.filter(
      (season) => season.rank !== null && season.rank !== undefined
    );

    let playerAverage: number | null = null;
    if (rankedSeasons.length > 0) {
      const totalRating = rankedSeasons.reduce(
        (sum, season) => sum + (season.rank as number),
        0
      );
      playerAverage = totalRating / rankedSeasons.length;
    }

    // Categorize by gender
    const group = getGenderGroup(player.gender);
    genderGroups[group].count++;
    if (playerAverage !== null) {
      genderGroups[group].ratings.push(playerAverage);
    }
  });

  // Calculate stats for each gender
  const calculateStats = (stats: {
    ratings: number[];
    count: number;
  }): GenderStats => ({
    averageRating:
      stats.ratings.length > 0
        ? Math.round(
            (stats.ratings.reduce((sum, rating) => sum + rating, 0) /
              stats.ratings.length) *
              100
          ) / 100
        : null,
    playerCount: stats.count,
    percentage:
      totalPlayers > 0
        ? Math.round((stats.count / totalPlayers) * 100 * 100) / 100
        : 0,
  });

  return {
    male: calculateStats(genderGroups.male),
    female: calculateStats(genderGroups.female),
    nonBinary: calculateStats(genderGroups.nonBinary),
    unspecified: calculateStats(genderGroups.unspecified),
    totalPlayers,
  };
}

/**
 * Helper function to get gender group key
 */
function getGenderGroup(
  gender: string | null
): "male" | "female" | "nonBinary" | "unspecified" {
  switch (gender) {
    case "MALE":
      return "male";
    case "FEMALE":
      return "female";
    case "NON_BINARY":
      return "nonBinary";
    default:
      return "unspecified";
  }
}

/**
 * Filter players by gender
 */
export function filterPlayersByGender(
  players: PlayerWithRatings[],
  genderFilter: "all" | "male" | "female" | "non-binary" | "unspecified"
): PlayerWithRatings[] {
  if (genderFilter === "all") return players;

  return players.filter((player) => {
    switch (genderFilter) {
      case "male":
        return player.gender === "MALE";
      case "female":
        return player.gender === "FEMALE";
      case "non-binary":
        return player.gender === "NON_BINARY";
      case "unspecified":
        return player.gender === null;
      default:
        return true;
    }
  });
}

/**
 * Sort players alphabetically by name
 */
export function sortPlayersByName(
  players: PlayerWithRatings[]
): PlayerWithRatings[] {
  return [...players].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}
