"use client";

import { useState, useCallback, useTransition } from "react";
import { PlayerService } from "../services/playerService";

export function useBulkPlayerActions() {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const togglePlayerSelection = useCallback((playerId: number) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  }, []);

  const selectAllPlayers = useCallback((playerIds: number[]) => {
    setSelectedPlayers(new Set(playerIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlayers(new Set());
    setIsSelectionMode(false);
  }, []);

  const bulkUpdateGender = useCallback((playerIds: number[], gender: string | null) => {
    startTransition(async () => {
      try {
        await PlayerService.bulkUpdateGender(playerIds, gender);
        clearSelection();
        window.location.reload(); // TODO: Replace with proper state management
      } catch (error) {
        console.error("Error updating player genders:", error);
        // TODO: Add proper error handling
      }
    });
  }, [clearSelection]);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return {
    selectedPlayers,
    isSelectionMode,
    isPending,
    togglePlayerSelection,
    selectAllPlayers,
    clearSelection,
    bulkUpdateGender,
    enterSelectionMode,
    exitSelectionMode,
  };
}