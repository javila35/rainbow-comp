"use client";

import { useState, useEffect } from "react";

interface Player {
  id: number;
  name: string;
}

interface PlayerSearchProps {
  seasonId: number;
  onPlayerAdd: (playerId: number) => Promise<void>;
  onPlayerCreate: (playerName: string) => Promise<void>;
  availablePlayers: Player[];
}

export default function PlayerSearch({
  onPlayerAdd,
  onPlayerCreate,
  availablePlayers,
}: PlayerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPlayers([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      return;
    }

    const filtered = availablePlayers.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(filtered);
    setShowSuggestions(true);
    setSelectedIndex(-1); // Reset selection when search term changes
  }, [searchTerm, availablePlayers]);
  const handlePlayerSelect = async (player: Player) => {
    setIsLoading(true);
    try {
      await onPlayerAdd(player.id);
      setSearchTerm("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Failed to add player:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      await onPlayerCreate(searchTerm.trim());
      setSearchTerm("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Failed to create player:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    const totalItems =
      filteredPlayers.length +
      (filteredPlayers.length === 0 && searchTerm.trim() ? 1 : 0);
    if (totalItems === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (
          filteredPlayers.length > 0 &&
          selectedIndex >= 0 &&
          selectedIndex < filteredPlayers.length
        ) {
          handlePlayerSelect(filteredPlayers[selectedIndex]);
        } else if (
          filteredPlayers.length === 0 &&
          searchTerm.trim() &&
          selectedIndex === 0
        ) {
          handleCreatePlayer();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  return (
    <div className="relative w-full max-w-md">
      {" "}
      <input
        type="text"
        placeholder="Search players to add to season..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => searchTerm && setShowSuggestions(true)}
        onBlur={handleInputBlur}
        disabled={isLoading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {showSuggestions && filteredPlayers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredPlayers.map((player, index) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player)}
              disabled={isLoading}
              className={`w-full px-4 py-2 text-left focus:outline-none disabled:opacity-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? "bg-blue-100 text-blue-900"
                  : "hover:bg-gray-100 focus:bg-gray-100"
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>
      )}
      {showSuggestions &&
        filteredPlayers.length === 0 &&
        searchTerm.trim() !== "" && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <button
              onClick={handleCreatePlayer}
              disabled={isLoading}
              className={`w-full px-4 py-2 text-left focus:outline-none disabled:opacity-50 ${
                selectedIndex === 0
                  ? "bg-green-100 text-green-900"
                  : "hover:bg-gray-100 focus:bg-gray-100"
              }`}
            >
              <span className="text-green-600 font-medium">
                + Create new player:
              </span>{" "}
              "{searchTerm}"
            </button>
          </div>
        )}
    </div>
  );
}
