"use client";

import { useState, useCallback, useRef } from "react";

interface RankingInputProps {
  playerId: number;
  seasonId: number;
  initialRank?: number | null;
  onRankUpdate: (playerId: number, seasonId: number, rank: number) => Promise<void>;
}

export default function RankingInput({ 
  playerId, 
  seasonId, 
  initialRank, 
  onRankUpdate 
}: RankingInputProps) {
  const [rank, setRank] = useState(initialRank?.toString());
  const [error, setError] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setRank(newValue);
    setError(""); // Clear error when user starts typing

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for 3 seconds
    timeoutRef.current = setTimeout(async () => {
      if (newValue && !isNaN(Number(newValue))) {
        const numValue = Number(newValue);
        if (numValue < 1 || numValue > 10) {
          setError("Rank must be between 1 and 10");
          return;
        }
        try {
          await onRankUpdate(playerId, seasonId, numValue);
        } catch (error) {
          setError("Failed to update rank");
        }
      }
    }, 2000);
  };

  return (
    <div className="w-full">
      <input
        placeholder="Enter ranking (1-10)"
        type="number"
        min="1"
        max="10"
        value={rank}
        onChange={handleChange}
        className={`w-full px-2 py-1 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
