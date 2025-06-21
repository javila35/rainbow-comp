/**
 * Utility functions for calculating player statistics
 */

import { sortSeasonsChronologically } from "./seasonSorting";

export interface PlayerSeasonRanking {
  id: number;
  rank: any; // Decimal or null from Prisma
  season: {
    id: number;
    name: string;
  };
}

export interface PlayerStats {
  totalSeasons: number;
  firstSeason: string | null;
  mostRecentSeason: string | null;
  averageRating: number | null;
  ratingChange: number | null;
  averageChangePerSeason: number | null;
  hasRankedSeasons: boolean;
}

/**
 * Calculate comprehensive statistics for a player
 * @param seasonRankings - Array of season rankings for the player
 * @returns PlayerStats object with calculated statistics
 */
export function calculatePlayerStats(seasonRankings: PlayerSeasonRanking[]): PlayerStats {  if (seasonRankings.length === 0) {
    return {
      totalSeasons: 0,
      firstSeason: null,
      mostRecentSeason: null,
      averageRating: null,
      ratingChange: null,
      averageChangePerSeason: null,
      hasRankedSeasons: false,
    };
  }

  // Sort seasons chronologically (most recent first)
  const sortedSeasons = sortSeasonsChronologically(
    seasonRankings,
    (ranking) => ranking.season.name
  );

  // Basic stats
  const totalSeasons = seasonRankings.length;
  const mostRecentSeason = sortedSeasons[0]?.season.name || null;
  const firstSeason = sortedSeasons[sortedSeasons.length - 1]?.season.name || null;

  // Get seasons with ranks (filter out null ranks)
  const rankedSeasons = sortedSeasons.filter(
    (season) => season.rank !== null && season.rank !== undefined
  );
  if (rankedSeasons.length === 0) {
    return {
      totalSeasons,
      firstSeason,
      mostRecentSeason,
      averageRating: null,
      ratingChange: null,
      averageChangePerSeason: null,
      hasRankedSeasons: false,
    };
  }

  // Calculate average rating
  const totalRating = rankedSeasons.reduce(
    (sum, season) => sum + parseFloat(season.rank.toString()),
    0
  );
  const averageRating = totalRating / rankedSeasons.length;
  // Calculate rating change (most recent ranked season - first ranked season)
  let ratingChange: number | null = null;
  let averageChangePerSeason: number | null = null;
  
  if (rankedSeasons.length >= 2) {
    // Find the first and most recent seasons with ranks
    const mostRecentRanked = rankedSeasons[0];
    const firstRanked = rankedSeasons[rankedSeasons.length - 1];
    
    ratingChange = 
      parseFloat(mostRecentRanked.rank.toString()) - 
      parseFloat(firstRanked.rank.toString());
    
    // Calculate average change per season
    // Total change divided by the number of season gaps (total seasons - 1)
    averageChangePerSeason = ratingChange / (rankedSeasons.length - 1);
    averageChangePerSeason = Math.round(averageChangePerSeason * 100) / 100; // Round to 2 decimal places
  }

  return {
    totalSeasons,
    firstSeason,
    mostRecentSeason,
    averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
    ratingChange: ratingChange !== null ? Math.round(ratingChange * 100) / 100 : null,
    averageChangePerSeason,
    hasRankedSeasons: true,
  };
}

/**
 * Format rating change for display with appropriate styling
 * @param ratingChange - The rating change value
 * @returns Object with formatted text and CSS classes
 */
export function formatRatingChange(ratingChange: number | null): {
  text: string;
  className: string;
} {
  if (ratingChange === null) {
    return {
      text: "No change data",
      className: "text-gray-500",
    };
  }

  if (ratingChange > 0) {
    return {
      text: `+${ratingChange}`,
      className: "text-green-600 font-semibold",
    };
  } else if (ratingChange < 0) {
    return {
      text: `${ratingChange}`,
      className: "text-red-600 font-semibold",
    };
  } else {
    return {
      text: "No change",
      className: "text-gray-600",
    };
  }
}

/**
 * Format average change per season for display with appropriate styling
 * @param averageChange - The average change per season value
 * @returns Object with formatted text and CSS classes
 */
export function formatAverageChangePerSeason(averageChange: number | null): {
  text: string;
  className: string;
} {
  if (averageChange === null) {
    return {
      text: "No data",
      className: "text-gray-500",
    };
  }

  if (averageChange > 0) {
    return {
      text: `+${averageChange}/season`,
      className: "text-green-600 font-semibold",
    };
  } else if (averageChange < 0) {
    return {
      text: `${averageChange}/season`,
      className: "text-red-600 font-semibold",
    };
  } else {
    return {
      text: "0/season",
      className: "text-gray-600",
    };
  }
}
