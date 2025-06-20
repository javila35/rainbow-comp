"use client";

import { useState, useRef, useEffect } from "react";
import RankingInput, { type RankingInputRef } from "./RankingInput";
import DeletePlayerButton from "./DeletePlayerButton";
import isOddNumber from "@/lib/utils/isOddNumber";

type SortField = "name" | "rank";
type SortDirection = "asc" | "desc";

interface Player {
  id: number;
  rank: number | null;
  player: {
    name: string;
    id: number;
  };
}

interface SortablePlayerTableProps {
  players: Player[];
  seasonId: number;
  focusPlayerId?: number | null;
  onRankUpdate: (
    playerId: number,
    seasonId: number,
    rank: number,
  ) => Promise<void>;
  onRemove: (playerId: number) => Promise<void>;
}

export default function SortablePlayerTable({
  players,
  seasonId,
  focusPlayerId,
  onRankUpdate,
  onRemove,
}: SortablePlayerTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const rankingInputRefs = useRef<{
    [playerId: number]: RankingInputRef | null;
  }>({});
  useEffect(() => {
    // Check for localStorage focus on mount (survives revalidation)
    const storedFocusId = localStorage.getItem("focusPlayerId");
    if (storedFocusId && !focusPlayerId) {
      console.log("Found stored focus ID:", storedFocusId);
      // Try to focus this player
      const playerId = parseInt(storedFocusId);
      const attemptFocus = (attempt: number) => {
        console.log(`Stored focus attempt ${attempt} for player:`, playerId);

        if (rankingInputRefs.current[playerId]) {
          console.log("Ref found for stored focus, focusing...");
          rankingInputRefs.current[playerId]?.focus();
          localStorage.removeItem("focusPlayerId"); // Clean up
        } else {
          console.log("Ref not found for stored focus, will retry...");
          if (attempt < 10) {
            setTimeout(() => attemptFocus(attempt + 1), attempt * 100);
          } else {
            localStorage.removeItem("focusPlayerId"); // Clean up after max attempts
          }
        }
      };

      setTimeout(() => attemptFocus(1), 200);
    }
  }, [players]); // Run when players change (after revalidation)

  useEffect(() => {
    console.log("Focus effect triggered with focusPlayerId:", focusPlayerId);
    console.log("Available refs:", Object.keys(rankingInputRefs.current));
    console.log(
      "Players:",
      players.map((p) => p.player.id),
    );

    if (focusPlayerId) {
      // Try multiple times with increasing delays to handle the revalidation timing
      const attemptFocus = (attempt: number) => {
        console.log(`Focus attempt ${attempt} for player:`, focusPlayerId);

        if (rankingInputRefs.current[focusPlayerId]) {
          console.log("Ref found, focusing...");
          rankingInputRefs.current[focusPlayerId]?.focus();
        } else {
          console.log("Ref not found, will retry...");
          if (attempt < 5) {
            setTimeout(() => attemptFocus(attempt + 1), attempt * 200);
          }
        }
      };

      // Start attempting focus after a short delay
      setTimeout(() => attemptFocus(1), 100);
    }
  }, [focusPlayerId, players]); // Add players as dependency to re-run when data changes

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending for new field
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "name") {
      aValue = a.player.name.toLowerCase();
      bValue = b.player.name.toLowerCase();
    } else {
      // For rank sorting, treat null as 0 or put at end
      aValue = a.rank ?? (sortDirection === "asc" ? Number.MAX_VALUE : -1);
      bValue = b.rank ?? (sortDirection === "asc" ? Number.MAX_VALUE : -1);
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return "";
    }
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <table className="table-fixed w-3/4 border-2 border-collapse">
      <thead>
        <tr>
          <th className="bg-gray-300 border-2 w-1/2">
            <button
              onClick={() => handleSort("name")}
              className="w-full h-full px-2 py-2 hover:bg-gray-400 transition-colors flex items-center justify-between"
            >
              <span>Player Name</span>
              <span className="text-sm">{getSortIcon("name")}</span>
            </button>
          </th>
          <th className="bg-gray-300 border-2 w-1/3">
            <button
              onClick={() => handleSort("rank")}
              className="w-full h-full px-2 py-2 hover:bg-gray-400 transition-colors flex items-center justify-between"
            >
              <span>Rank</span>
              <span className="text-sm">{getSortIcon("rank")}</span>
            </button>
          </th>
          <th className="bg-gray-300 border-2 w-1/6"></th>
        </tr>
      </thead>
      <tbody>
        {sortedPlayers.map((player, index) => (
          <tr key={player.id}>
            <td
              className={`${
                isOddNumber(index) ? "bg-gray-300" : ""
              } border-2 px-2`}
            >
              {player.player.name}
            </td>
            <td
              className={`${
                isOddNumber(index) ? "bg-gray-300" : ""
              } border-2 p-2`}
            >
              {" "}
              <RankingInput
                ref={(ref) => {
                  if (ref) {
                    console.log("Setting ref for player:", player.player.id);
                    rankingInputRefs.current[player.player.id] = ref;
                  }
                }}
                playerId={player.player.id}
                seasonId={seasonId}
                initialRank={player.rank}
                onRankUpdate={onRankUpdate}
              />
            </td>
            <td
              className={`${
                isOddNumber(index) ? "bg-gray-300" : ""
              } border-2 p-2 text-center`}
            >
              <DeletePlayerButton
                playerName={player.player.name}
                playerId={player.player.id}
                onRemove={onRemove}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
