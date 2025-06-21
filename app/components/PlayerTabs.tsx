"use client";

import { useState } from "react";
import Link from "next/link";
import { CARD_CLASSES, CARD_LINK_CLASSES, GLASSY_CONTAINER_CLASSES } from "@/lib/utils/styles";

interface Player {
  id: number;
  name: string;
  gender: string | null;
  seasons: {
    rank: any; // Decimal or null from Prisma
  }[];
}

interface PlayerTabsProps {
  players: Player[];
}

interface GenderStats {
  averageRating: number | null;
  playerCount: number;
  percentage: number;
}

interface PlayerStatistics {
  male: GenderStats;
  female: GenderStats;
  nonBinary: GenderStats;
  unspecified: GenderStats;
  totalPlayers: number;
}

function calculatePlayerStatistics(players: Player[]): PlayerStatistics {
  const totalPlayers = players.length;
    // Group players by gender
  const maleStats = { ratings: [] as number[], count: 0 };
  const femaleStats = { ratings: [] as number[], count: 0 };
  const nonBinaryStats = { ratings: [] as number[], count: 0 };
  const unspecifiedStats = { ratings: [] as number[], count: 0 };

  players.forEach(player => {
    // Calculate average rating for this player
    const rankedSeasons = player.seasons.filter(season => 
      season.rank !== null && season.rank !== undefined
    );
    
    let playerAverage: number | null = null;
    if (rankedSeasons.length > 0) {
      const totalRating = rankedSeasons.reduce(
        (sum, season) => sum + parseFloat(season.rank.toString()),
        0
      );
      playerAverage = totalRating / rankedSeasons.length;
    }

    // Categorize by gender
    switch (player.gender) {
      case "MALE":
        maleStats.count++;
        if (playerAverage !== null) maleStats.ratings.push(playerAverage);
        break;
      case "FEMALE":
        femaleStats.count++;
        if (playerAverage !== null) femaleStats.ratings.push(playerAverage);
        break;
      case "NON_BINARY":
        nonBinaryStats.count++;
        if (playerAverage !== null) nonBinaryStats.ratings.push(playerAverage);
        break;
      default:
        unspecifiedStats.count++;
        if (playerAverage !== null) unspecifiedStats.ratings.push(playerAverage);
        break;
    }
  });

  // Calculate averages and percentages
  const calculateStats = (stats: { ratings: number[], count: number }): GenderStats => ({
    averageRating: stats.ratings.length > 0 
      ? Math.round((stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length) * 100) / 100
      : null,
    playerCount: stats.count,
    percentage: totalPlayers > 0 ? Math.round((stats.count / totalPlayers) * 100 * 100) / 100 : 0,
  });

  return {
    male: calculateStats(maleStats),
    female: calculateStats(femaleStats),
    nonBinary: calculateStats(nonBinaryStats),
    unspecified: calculateStats(unspecifiedStats),
    totalPlayers,
  };
}

type GenderFilter = "all" | "male" | "female" | "non-binary" | "unspecified";

export default function PlayerTabs({ players }: PlayerTabsProps) {
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  
  // Filter players by gender
  const filteredPlayers = players.filter(player => {
    if (genderFilter === "all") return true;
    if (genderFilter === "male") return player.gender === "MALE";
    if (genderFilter === "female") return player.gender === "FEMALE";
    if (genderFilter === "non-binary") return player.gender === "NON_BINARY";
    if (genderFilter === "unspecified") return player.gender === null;
    return true;
  });
  
  // Sort players alphabetically by name for the list view
  const sortedPlayers = filteredPlayers.sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  const statistics = calculatePlayerStatistics(players);

  return (
    <div className="w-full max-w-6xl px-4">
      {/* Tab Navigation */}
      <div className="flex mb-8 bg-white/30 backdrop-blur-md rounded-lg p-1 border border-white/40">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-200 ${
            activeTab === "list"
              ? "bg-white/70 text-gray-900 shadow-md"
              : "text-gray-700 hover:bg-white/40"
          }`}
        >
          Player List
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-200 ${
            activeTab === "stats"
              ? "bg-white/70 text-gray-900 shadow-md"
              : "text-gray-700 hover:bg-white/40"
          }`}
        >
          Statistics
        </button>
      </div>      {/* Tab Content */}
      {activeTab === "list" ? (
        // Player List View
        <div>          {/* Gender Filter */}
          <div className="mb-6">
            <div className={`${GLASSY_CONTAINER_CLASSES} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filter by Gender</h3>
                {genderFilter !== "all" && (
                  <span className="text-sm text-gray-600">
                    Showing {sortedPlayers.length} of {players.length} players
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGenderFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "all"
                      ? "bg-gray-700 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  All ({players.length})
                </button>
                <button
                  onClick={() => setGenderFilter("male")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "male"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Male ({players.filter(p => p.gender === "MALE").length})
                </button>
                <button
                  onClick={() => setGenderFilter("female")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "female"
                      ? "bg-pink-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Female ({players.filter(p => p.gender === "FEMALE").length})
                </button>
                <button
                  onClick={() => setGenderFilter("non-binary")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "non-binary"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Non-Binary ({players.filter(p => p.gender === "NON_BINARY").length})
                </button>
                <button
                  onClick={() => setGenderFilter("unspecified")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "unspecified"
                      ? "bg-gray-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Unspecified ({players.filter(p => p.gender === null).length})
                </button>
              </div>
            </div>
          </div>

          {/* Player List */}
          {sortedPlayers.length === 0 ? (
            <p className="text-gray-600 text-center">
              {players.length === 0 
                ? "No players created yet." 
                : `No players found with ${genderFilter === "all" ? "any" : genderFilter} gender.`
              }
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPlayers.map((player) => (
                <div key={player.id} className={CARD_CLASSES}>
                  <Link
                    href={`/players/${player.id}`}
                    className={CARD_LINK_CLASSES}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {player.gender === "MALE" ? "Male" 
                         : player.gender === "FEMALE" ? "Female"
                         : player.gender === "NON_BINARY" ? "Non-Binary"
                         : "Gender not set"}
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Statistics View
        <div className="space-y-8">
          {/* Gender Rating Averages */}
          <div className={GLASSY_CONTAINER_CLASSES}>
            <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
              Average Ratings by Gender
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {statistics.male.averageRating !== null 
                    ? statistics.male.averageRating.toFixed(2) 
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">Male Average</div>
                <div className="text-xs text-gray-500">
                  ({statistics.male.playerCount} players)
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">
                  {statistics.female.averageRating !== null 
                    ? statistics.female.averageRating.toFixed(2) 
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">Female Average</div>
                <div className="text-xs text-gray-500">
                  ({statistics.female.playerCount} players)
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {statistics.nonBinary.averageRating !== null 
                    ? statistics.nonBinary.averageRating.toFixed(2) 
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">Non-Binary Average</div>
                <div className="text-xs text-gray-500">
                  ({statistics.nonBinary.playerCount} players)
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {statistics.unspecified.averageRating !== null 
                    ? statistics.unspecified.averageRating.toFixed(2) 
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">Unspecified Average</div>
                <div className="text-xs text-gray-500">
                  ({statistics.unspecified.playerCount} players)
                </div>
              </div>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className={GLASSY_CONTAINER_CLASSES}>
            <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
              Player Distribution by Gender
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {statistics.male.percentage}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Male</div>
                <div className="text-xs text-gray-500">
                  {statistics.male.playerCount} of {statistics.totalPlayers}
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">
                  {statistics.female.percentage}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Female</div>
                <div className="text-xs text-gray-500">
                  {statistics.female.playerCount} of {statistics.totalPlayers}
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {statistics.nonBinary.percentage}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Non-Binary</div>
                <div className="text-xs text-gray-500">
                  {statistics.nonBinary.playerCount} of {statistics.totalPlayers}
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">
                  {statistics.unspecified.percentage}%
                </div>
                <div className="text-sm text-gray-700 font-medium">Unspecified</div>
                <div className="text-xs text-gray-500">
                  {statistics.unspecified.playerCount} of {statistics.totalPlayers}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className={GLASSY_CONTAINER_CLASSES}>
            <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
              Overall Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {statistics.totalPlayers}
                </div>
                <div className="text-sm text-gray-700 font-medium">Total Players</div>
              </div>

              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {players.filter(p => p.seasons.some(s => s.rank !== null)).length}
                </div>
                <div className="text-sm text-gray-700 font-medium">Ranked Players</div>
              </div>

              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {players.filter(p => p.gender === null).length}
                </div>
                <div className="text-sm text-gray-700 font-medium">Gender Not Set</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
