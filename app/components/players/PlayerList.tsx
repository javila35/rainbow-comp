"use client";

import Link from "next/link";
import { useState } from "react";
import { CARD_CLASSES, CARD_LINK_CLASSES, GLASSY_CONTAINER_CLASSES } from "@/lib/utils/styles";
import { getGenderLabel, filterPlayersByGender, sortPlayersByName, getGenderCounts, type PlayerWithRatings } from "@/lib/utils/genderUtils";
import { useBulkPlayerActions } from "@/lib/hooks/useBulkPlayerActions";
import { BulkActionsPanel } from "./BulkActionsPanel";

type GenderFilter = "all" | "male" | "female" | "non-binary" | "unspecified";

interface PlayerListProps {
  players: PlayerWithRatings[];
}

export default function PlayerList({ players }: PlayerListProps) {
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const bulkActions = useBulkPlayerActions();

  const filteredPlayers = filterPlayersByGender(players, genderFilter);
  const sortedPlayers = sortPlayersByName(filteredPlayers);
  const genderCounts = getGenderCounts(players);

  const selectAllFiltered = () => {
    const filteredPlayerIds = filteredPlayers.map((p) => p.id);
    bulkActions.selectAllPlayers(filteredPlayerIds);
  };

  return (
    <div>
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
                onClick={() => bulkActions.isSelectionMode ? bulkActions.exitSelectionMode() : bulkActions.enterSelectionMode()}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  bulkActions.isSelectionMode
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-green-600 text-white shadow-md hover:bg-green-700"
                }`}
              >
                {bulkActions.isSelectionMode ? "Cancel Selection" : "Bulk Edit"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={genderFilter === "all"}
              onClick={() => setGenderFilter("all")}
              className="bg-gray-700"
            >
              All ({genderCounts.all})
            </FilterButton>
            <FilterButton
              active={genderFilter === "male"}
              onClick={() => setGenderFilter("male")}
              className="bg-blue-600"
            >
              Male ({genderCounts.male})
            </FilterButton>
            <FilterButton
              active={genderFilter === "female"}
              onClick={() => setGenderFilter("female")}
              className="bg-pink-600"
            >
              Female ({genderCounts.female})
            </FilterButton>
            <FilterButton
              active={genderFilter === "non-binary"}
              onClick={() => setGenderFilter("non-binary")}
              className="bg-purple-600"
            >
              Non-Binary ({genderCounts.nonBinary})
            </FilterButton>
            <FilterButton
              active={genderFilter === "unspecified"}
              onClick={() => setGenderFilter("unspecified")}
              className="bg-gray-600"
            >
              Unspecified ({genderCounts.unspecified})
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {bulkActions.isSelectionMode && (
        <BulkActionsPanel
          selectedCount={bulkActions.selectedPlayers.size}
          onSelectAllFiltered={selectAllFiltered}
          onClearSelection={bulkActions.clearSelection}
          onBulkUpdateGender={bulkActions.bulkUpdateGender}
          selectedPlayerIds={Array.from(bulkActions.selectedPlayers)}
          isPending={bulkActions.isPending}
        />
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
                bulkActions.isSelectionMode ? "cursor-pointer" : ""
              }`}
            >
              {bulkActions.isSelectionMode ? (
                <PlayerSelectionCard
                  player={player}
                  isSelected={bulkActions.selectedPlayers.has(player.id)}
                  onToggle={() => bulkActions.togglePlayerSelection(player.id)}
                />
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
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}

function FilterButton({ active, onClick, className, children }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        active
          ? `${className} text-white shadow-md`
          : "bg-white/60 text-gray-700 hover:bg-white/80 border border-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

interface PlayerSelectionCardProps {
  player: PlayerWithRatings;
  isSelected: boolean;
  onToggle: () => void;
}

function PlayerSelectionCard({ player, isSelected, onToggle }: PlayerSelectionCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`p-4 rounded-lg transition-all duration-200 ${
        isSelected
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
            isSelected
              ? "bg-blue-500 border-blue-500"
              : "border-gray-300"
          }`}
        >
          {isSelected && (
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
  );
}