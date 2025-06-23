import { GLASSY_CONTAINER_CLASSES } from "@/lib/utils/styles";

interface SeasonPlayer {
  id: number;
  rank: number | null;
  player: {
    id: number;
    name: string;
    gender: string | null;
  };
}

interface SeasonStatisticsProps {
  players: SeasonPlayer[];
  seasonName: string;
}

interface GenderStats {
  count: number;
  percentage: number;
  averageRating: number | null;
}

interface SeasonStats {
  totalPlayers: number;
  rankedPlayers: number;
  overallAverage: number | null;
  highestRated: { player: string; rating: number } | null;
  lowestRated: { player: string; rating: number } | null;
  genderBreakdown: {
    male: GenderStats;
    female: GenderStats;
    nonBinary: GenderStats;
    unspecified: GenderStats;
  };
}

function calculateSeasonStatistics(players: SeasonPlayer[]): SeasonStats {
  const totalPlayers = players.length;
  const rankedPlayers = players.filter(p => p.rank !== null);
  
  // Calculate overall average
  let overallAverage: number | null = null;
  if (rankedPlayers.length > 0) {
    const total = rankedPlayers.reduce((sum, p) => sum + (p.rank || 0), 0);
    overallAverage = Math.round((total / rankedPlayers.length) * 100) / 100;
  }

  // Find highest and lowest rated players
  let highestRated: { player: string; rating: number } | null = null;
  let lowestRated: { player: string; rating: number } | null = null;
  
  if (rankedPlayers.length > 0) {
    const sortedByRating = rankedPlayers.sort((a, b) => (b.rank || 0) - (a.rank || 0));
    highestRated = {
      player: sortedByRating[0].player.name,
      rating: sortedByRating[0].rank || 0
    };
    lowestRated = {
      player: sortedByRating[sortedByRating.length - 1].player.name,
      rating: sortedByRating[sortedByRating.length - 1].rank || 0
    };
  }

  // Gender breakdown
  const genderGroups = {
    male: players.filter(p => p.player.gender === "MALE"),
    female: players.filter(p => p.player.gender === "FEMALE"),
    nonBinary: players.filter(p => p.player.gender === "NON_BINARY"),
    unspecified: players.filter(p => p.player.gender === null),
  };

  const calculateGenderStats = (genderPlayers: SeasonPlayer[]): GenderStats => {
    const rankedInGender = genderPlayers.filter(p => p.rank !== null);
    let averageRating: number | null = null;
    
    if (rankedInGender.length > 0) {
      const total = rankedInGender.reduce((sum, p) => sum + (p.rank || 0), 0);
      averageRating = Math.round((total / rankedInGender.length) * 100) / 100;
    }

    return {
      count: genderPlayers.length,
      percentage: totalPlayers > 0 ? Math.round((genderPlayers.length / totalPlayers) * 100) : 0,
      averageRating,
    };
  };

  return {
    totalPlayers,
    rankedPlayers: rankedPlayers.length,
    overallAverage,
    highestRated,
    lowestRated,
    genderBreakdown: {
      male: calculateGenderStats(genderGroups.male),
      female: calculateGenderStats(genderGroups.female),
      nonBinary: calculateGenderStats(genderGroups.nonBinary),
      unspecified: calculateGenderStats(genderGroups.unspecified),
    },
  };
}

export default function SeasonStatistics({ players, seasonName }: SeasonStatisticsProps) {
  const stats = calculateSeasonStatistics(players);

  return (
    <div className="w-full max-w-6xl px-4 space-y-8">
      {/* Overall Statistics */}
      <div className={GLASSY_CONTAINER_CLASSES}>
        <h2 className="text-2xl font-bold mb-6 text-[#333333] text-center">
          {seasonName} Statistics
        </h2>        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalPlayers}
            </div>
            <div className="text-sm text-gray-700 font-medium">Total Players</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.rankedPlayers}
            </div>
            <div className="text-sm text-gray-700 font-medium">Ranked Players</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.overallAverage !== null ? stats.overallAverage.toFixed(2) : "N/A"}
            </div>
            <div className="text-sm text-gray-700 font-medium">Overall Average</div>
          </div>
        </div>
      </div>

      {/* Top/Bottom Performers */}
      {(stats.highestRated || stats.lowestRated) && (
        <div className={GLASSY_CONTAINER_CLASSES}>
          <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
            High & Low
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.highestRated && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats.highestRated.rating.toFixed(2)}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">
                  {stats.highestRated.player}
                </div>
                <div className="text-sm text-gray-700 font-medium">Highest Rated</div>
              </div>
            )}
            
            {stats.lowestRated && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {stats.lowestRated.rating.toFixed(2)}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">
                  {stats.lowestRated.player}
                </div>
                <div className="text-sm text-gray-700 font-medium">Lowest Rated</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gender Participation Breakdown */}
      <div className={GLASSY_CONTAINER_CLASSES}>
        <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
          Player Participation by Gender
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.genderBreakdown.male.percentage}%
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Male</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.male.count} players
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {stats.genderBreakdown.female.percentage}%
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Female</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.female.count} players
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.genderBreakdown.nonBinary.percentage}%
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Non-Binary</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.nonBinary.count} players
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {stats.genderBreakdown.unspecified.percentage}%
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Unspecified</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.unspecified.count} players
            </div>
          </div>
        </div>
      </div>

      {/* Average Rating by Gender */}
      <div className={GLASSY_CONTAINER_CLASSES}>
        <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
          Average Rating by Gender
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.genderBreakdown.male.averageRating !== null 
                ? stats.genderBreakdown.male.averageRating.toFixed(2) 
                : "N/A"}
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Male</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.male.count > 0 
                ? `${players.filter(p => p.player.gender === "MALE" && p.rank !== null).length} ranked`
                : "No players"}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {stats.genderBreakdown.female.averageRating !== null 
                ? stats.genderBreakdown.female.averageRating.toFixed(2) 
                : "N/A"}
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Female</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.female.count > 0 
                ? `${players.filter(p => p.player.gender === "FEMALE" && p.rank !== null).length} ranked`
                : "No players"}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.genderBreakdown.nonBinary.averageRating !== null 
                ? stats.genderBreakdown.nonBinary.averageRating.toFixed(2) 
                : "N/A"}
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Non-Binary</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.nonBinary.count > 0 
                ? `${players.filter(p => p.player.gender === "NON_BINARY" && p.rank !== null).length} ranked`
                : "No players"}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {stats.genderBreakdown.unspecified.averageRating !== null 
                ? stats.genderBreakdown.unspecified.averageRating.toFixed(2) 
                : "N/A"}
            </div>
            <div className="text-lg font-semibold text-gray-800 mb-1">Unspecified</div>
            <div className="text-sm text-gray-700">
              {stats.genderBreakdown.unspecified.count > 0 
                ? `${players.filter(p => p.player.gender === null && p.rank !== null).length} ranked`
                : "No players"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
