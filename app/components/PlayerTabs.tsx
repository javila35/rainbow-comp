"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CARD_CLASSES,
  CARD_LINK_CLASSES,
  GLASSY_CONTAINER_CLASSES,
} from "@/lib/utils/styles";
import {
  calculatePlayerStatistics,
  getGenderLabel,
  getGenderCounts,
  filterPlayersByGender,
  sortPlayersByName,
  type PlayerWithRatings,
} from "@/lib/utils/genderUtils";

interface PlayerTabsProps {
  players: PlayerWithRatings[];
}

type GenderFilter = "all" | "male" | "female" | "non-binary" | "unspecified";

export default function PlayerTabs({ players }: PlayerTabsProps) {
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(
    new Set()
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Function to update player genders in bulk
  const bulkUpdateGender = async (
    playerIds: number[],
    gender: string | null
  ) => {
    try {
      const response = await fetch("/api/players/bulk-update-gender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerIds, gender }),
      });

      if (!response.ok) {
        throw new Error("Failed to update player genders");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating player genders:", error);
      alert("Failed to update player genders. Please try again.");
    }
  };

  // Toggle player selection
  const togglePlayerSelection = (playerId: number) => {
    const newSelection = new Set(selectedPlayers);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayers(newSelection);
  };

  // Select all filtered players
  const selectAllFiltered = () => {
    const filteredPlayerIds = new Set(filteredPlayers.map((p) => p.id));
    setSelectedPlayers(filteredPlayerIds);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedPlayers(new Set());
    setIsSelectionMode(false);
  };

  // Handle bulk gender update
  const handleBulkGenderUpdate = (gender: string | null) => {
    if (selectedPlayers.size === 0) return;

    startTransition(() => {
      bulkUpdateGender(Array.from(selectedPlayers), gender);
    });
  };

  // Filter and sort players using utility functions
  const filteredPlayers = filterPlayersByGender(players, genderFilter);
  const sortedPlayers = sortPlayersByName(filteredPlayers);
  const genderCounts = getGenderCounts(players);
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
      </div>{" "}
      {/* Tab Content */}
      {activeTab === "list" ? (
        // Player List View
        <div>
          {" "}
          {/* Gender Filter */}
          <div className="mb-6">
            <div className={`${GLASSY_CONTAINER_CLASSES} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Filter by Gender
                </h3>
                <div className="flex items-center gap-4">
                  {genderFilter !== "all" && (
                    <span className="text-sm text-gray-600">
                      Showing {sortedPlayers.length} of {players.length} players
                    </span>
                  )}
                  <button
                    onClick={() => setIsSelectionMode(!isSelectionMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isSelectionMode
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-green-600 text-white shadow-md hover:bg-green-700"
                    }`}
                  >
                    {isSelectionMode ? "Cancel Selection" : "Bulk Edit"}
                  </button>
                </div>
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
                  All ({genderCounts.all})
                </button>
                <button
                  onClick={() => setGenderFilter("male")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "male"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Male ({genderCounts.male})
                </button>
                <button
                  onClick={() => setGenderFilter("female")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "female"
                      ? "bg-pink-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Female ({genderCounts.female})
                </button>
                <button
                  onClick={() => setGenderFilter("non-binary")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "non-binary"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Non-Binary ({genderCounts.nonBinary})
                </button>
                <button
                  onClick={() => setGenderFilter("unspecified")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    genderFilter === "unspecified"
                      ? "bg-gray-600 text-white shadow-md"
                      : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
                  }`}
                >
                  Unspecified ({genderCounts.unspecified})
                </button>
              </div>
            </div>
          </div>
          {/* Bulk Actions Panel */}
          {isSelectionMode && (
            <div
              className={`${GLASSY_CONTAINER_CLASSES} p-4 mb-6 border-l-4 border-blue-500`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Bulk Actions ({selectedPlayers.size} selected)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllFiltered}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Select All Filtered
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {selectedPlayers.size > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Set gender for {selectedPlayers.size} selected player
                    {selectedPlayers.size !== 1 ? "s" : ""}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleBulkGenderUpdate("MALE")}
                      disabled={isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Set to Male
                    </button>
                    <button
                      onClick={() => handleBulkGenderUpdate("FEMALE")}
                      disabled={isPending}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
                    >
                      Set to Female
                    </button>
                    <button
                      onClick={() => handleBulkGenderUpdate("NON_BINARY")}
                      disabled={isPending}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      Set to Non-Binary
                    </button>
                    <button
                      onClick={() => handleBulkGenderUpdate(null)}
                      disabled={isPending}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      Clear Gender
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Player List */}
          {sortedPlayers.length === 0 ? (
            <p className="text-gray-600 text-center">
              {players.length === 0
                ? "No players created yet."
                : `No players found with ${
                    genderFilter === "all" ? "any" : genderFilter
                  } gender.`}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`${CARD_CLASSES} ${
                    isSelectionMode ? "cursor-pointer" : ""
                  }`}
                >
                  {isSelectionMode ? (
                    <div
                      onClick={() => togglePlayerSelection(player.id)}
                      className={`p-4 rounded-lg transition-all duration-200 ${
                        selectedPlayers.has(player.id)
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-white/60 border-2 border-transparent hover:bg-white/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {getGenderLabel(player.gender)}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedPlayers.has(player.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPlayers.has(player.id) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/players/${player.id}`}
                      className={CARD_LINK_CLASSES}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs text-gray-500 mt-1">
                          {getGenderLabel(player.gender)}
                        </span>
                      </div>
                    </Link>
                  )}
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
                <div className="text-sm text-gray-700 font-medium">
                  Male Average
                </div>
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
                <div className="text-sm text-gray-700 font-medium">
                  Female Average
                </div>
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
                <div className="text-sm text-gray-700 font-medium">
                  Non-Binary Average
                </div>
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
                <div className="text-sm text-gray-700 font-medium">
                  Unspecified Average
                </div>
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
                <div className="text-sm text-gray-700 font-medium">
                  Non-Binary
                </div>
                <div className="text-xs text-gray-500">
                  {statistics.nonBinary.playerCount} of{" "}
                  {statistics.totalPlayers}
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-600 mb-2">
                  {statistics.unspecified.percentage}%
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Unspecified
                </div>
                <div className="text-xs text-gray-500">
                  {statistics.unspecified.playerCount} of{" "}
                  {statistics.totalPlayers}
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
                <div className="text-sm text-gray-700 font-medium">
                  Total Players
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {
                    players.filter((p) =>
                      p.seasons.some((s) => s.rank !== null)
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Ranked Players
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {players.filter((p) => p.gender === null).length}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Gender Not Set
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
