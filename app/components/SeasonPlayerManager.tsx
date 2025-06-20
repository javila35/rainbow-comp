"use client";

import { useState } from "react";
import PlayerSearch from "./PlayerSearch";
import SortablePlayerTable from "./SortablePlayerTable";

interface Player {
  id: number;
  rank: number | null;
  player: {
    name: string;
    id: number;
  };
}

interface AvailablePlayer {
  id: number;
  name: string;
}

interface SeasonPlayerManagerProps {
  seasonId: number;
  players: Player[];
  availablePlayers: AvailablePlayer[];
  onPlayerAdd: (playerId: number) => Promise<void>;
  onPlayerCreate: (playerName: string) => Promise<number>;
  onRankUpdate: (
    playerId: number,
    seasonId: number,
    rank: number,
  ) => Promise<void>;
  onRemove: (playerId: number) => Promise<void>;
}

export default function SeasonPlayerManager({
  seasonId,
  players,
  availablePlayers,
  onPlayerAdd,
  onPlayerCreate,
  onRankUpdate,
  onRemove,
}: SeasonPlayerManagerProps) {
  const [focusPlayerId, setFocusPlayerId] = useState<number | null>(null);
  const handlePlayerAdded = (playerId: number) => {
    setFocusPlayerId(playerId);

    // Set a more persistent focus mechanism using localStorage
    localStorage.setItem("focusPlayerId", playerId.toString());

    // Clear focus after a longer delay to allow for revalidation and re-render
    setTimeout(() => {
      setFocusPlayerId(null);
      localStorage.removeItem("focusPlayerId");
    }, 3000);
  };

  return (
    <>
      {/* Add Player Search */}
      <div className="mb-8 w-full max-w-md">
        <PlayerSearch
          seasonId={seasonId}
          onPlayerAdd={onPlayerAdd}
          onPlayerCreate={onPlayerCreate}
          onPlayerAdded={handlePlayerAdded}
          availablePlayers={availablePlayers}
        />
      </div>

      <h3 className="text-2xl font-bold mb-4 text-[#333333]">
        Current Players
      </h3>

      <SortablePlayerTable
        players={players}
        seasonId={seasonId}
        focusPlayerId={focusPlayerId}
        onRankUpdate={onRankUpdate}
        onRemove={onRemove}
      />
    </>
  );
}
