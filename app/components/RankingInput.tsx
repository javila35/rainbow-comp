"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { validateRank } from "@/lib/utils/validation";

interface RankingInputProps {
  playerId: number;
  seasonId: number;
  initialRank?: number | null;
  onRankUpdate: (
    playerId: number,
    seasonId: number,
    rank: number,
  ) => Promise<void>;
}

export interface RankingInputRef {
  focus: () => void;
}

const RankingInput = forwardRef<RankingInputRef, RankingInputProps>(
  ({ playerId, seasonId, initialRank, onRankUpdate }, ref) => {
    const [rank, setRank] = useState(initialRank?.toString() || "");
    const [error, setError] = useState<string>("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      },
    }));
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setRank(newValue);
      setError(""); // Clear error when user starts typing

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      } // Set new timeout for 3 seconds
      timeoutRef.current = setTimeout(async () => {
        if (newValue && !isNaN(Number(newValue))) {
          const numValue = Number(newValue);
          
          try {
            validateRank(numValue);
            await onRankUpdate(playerId, seasonId, numValue);
          } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to update rank");
          }
        }
      }, 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        localStorage.setItem("focusPlayerSearch", "true");
      }
    };

    return (
      <div className="w-full">
        {" "}
        <input
          ref={inputRef}
          placeholder="Enter ranking"
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={rank}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={`w-full px-2 py-1 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
    );
  },
);

RankingInput.displayName = "RankingInput";

export default RankingInput;
