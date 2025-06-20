"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";

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
        console.log("RankingInput focus method called for player:", playerId);
        console.log("Input ref current:", inputRef.current);
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
          console.log("Focus and select called successfully");
        } else {
          console.log("Input ref is null");
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
          if (numValue < 1 || numValue > 10) {
            setError("Rank must be between 1 and 10");
            return;
          }

          // Check for maximum 2 decimal places
          const decimalPlaces = (numValue.toString().split(".")[1] || "")
            .length;
          if (decimalPlaces > 2) {
            setError("Rank can have at most 2 decimal places");
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        console.log(
          "Enter pressed in RankingInput, setting focus back to PlayerSearch",
        );
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
