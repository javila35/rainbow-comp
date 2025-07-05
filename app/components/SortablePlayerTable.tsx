"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import RankingInput, { type RankingInputRef } from "./RankingInput";
import DeletePlayerButton from "./DeletePlayerButton";
import isOddNumber from "@/lib/utils/isOddNumber";
import { useFocusWithPersistence } from "@/lib/utils/focusUtils";
import {
  sortPlayers,
  getSortIcon,
  type PlayerSortField,
  type PlayerForSorting,
} from "@/lib/utils/tableUtils";

interface SortablePlayerTableProps {
  players: PlayerForSorting[];
  seasonId: number;
  focusPlayerId?: number | null;
  onRankUpdate: (
    playerId: number,
    seasonId: number,
    rank: number
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
  const [sortField, setSortField] = useState<PlayerSortField>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const rankingInputRefs = useRef<{
    [playerId: number]: RankingInputRef | null;
  }>({});

  // Use the focus utility
  const focusManager = useFocusWithPersistence(
    focusPlayerId ?? null,
    rankingInputRefs
  );

  useEffect(() => {
    focusManager.handleStoredFocus();
  }, [players, focusManager]);

  useEffect(() => {
    focusManager.handlePropFocus();
  }, [focusPlayerId, players, focusManager]);

  const handleSort = (field: PlayerSortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending for new field
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPlayers = sortPlayers(players, {
    field: sortField,
    direction: sortDirection,
  });

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
              <span className="text-sm">
                {getSortIcon(sortField, "name", sortDirection)}
              </span>
            </button>
          </th>
          <th className="bg-gray-300 border-2 w-1/3">
            <button
              onClick={() => handleSort("rank")}
              className="w-full h-full px-2 py-2 hover:bg-gray-400 transition-colors flex items-center justify-between"
            >
              <span>Rank</span>
              <span className="text-sm">
                {getSortIcon(sortField, "rank", sortDirection)}
              </span>
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
              <Link href={`/players/${player.player.id}`}>
                {player.player.name}
              </Link>
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
