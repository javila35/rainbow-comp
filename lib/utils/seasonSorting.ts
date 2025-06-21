/**
 * Utility functions for parsing and sorting seasons chronologically
 */

export interface ParsedSeason {
  year: number;
  season: string;
}

/**
 * Parse a season name in the format "[SEASON] [YEAR]"
 * @param name - Season name like "Summer 2025"
 * @returns Object with year and season
 */
export function parseSeasonName(name: string): ParsedSeason {
  const parts = name.trim().split(' ');
  const year = parseInt(parts[parts.length - 1]) || 0; // Last part should be year
  const season = parts.slice(0, -1).join(' '); // Everything except last part
  return { year, season };
}

/**
 * Get the chronological order of a season within a year
 * Winter=0, Spring=1, Summer=2, Fall=3
 * @param season - Season name
 * @returns Order number
 */
export function getSeasonOrder(season: string): number {
  const seasonLower = season.toLowerCase();
  if (seasonLower.includes('winter')) return 0;
  if (seasonLower.includes('spring')) return 1;
  if (seasonLower.includes('summer')) return 2;
  if (seasonLower.includes('fall') || seasonLower.includes('autumn')) return 3;
  return 4; // For any other season names
}

/**
 * Sort seasons chronologically (most recent first)
 * @param seasons - Array of objects with season names
 * @param getSeasonName - Function to extract season name from object
 * @returns Sorted array
 */
export function sortSeasonsChronologically<T>(
  seasons: T[],
  getSeasonName: (item: T) => string
): T[] {
  return seasons.sort((a, b) => {
    const seasonA = parseSeasonName(getSeasonName(a));
    const seasonB = parseSeasonName(getSeasonName(b));

    // First sort by year (descending - most recent first)
    if (seasonA.year !== seasonB.year) {
      return seasonB.year - seasonA.year;
    }

    // Then sort by season order (Fall, Summer, Spring, Winter for same year)
    // For descending chronological order: Fall > Summer > Spring > Winter
    const orderA = getSeasonOrder(seasonA.season);
    const orderB = getSeasonOrder(seasonB.season);
    
    return orderB - orderA; // Descending order
  });
}
