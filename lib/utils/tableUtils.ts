/**
 * Utility functions for table sorting
 */

export type SortDirection = "asc" | "desc";

export interface SortState<T extends string> {
  field: T;
  direction: SortDirection;
}

/**
 * Generic table sorting logic
 */
export function createTableSorter<T extends string>() {
  const handleSort = (
    currentField: T,
    currentDirection: SortDirection,
    newField: T
  ): SortState<T> => {
    if (currentField === newField) {
      // Toggle direction if same field
      return {
        field: newField,
        direction: currentDirection === "asc" ? "desc" : "asc",
      };
    } else {
      // Default to ascending for new field
      return {
        field: newField,
        direction: "asc",
      };
    }
  };

  const sortData = <TData>(
    data: TData[],
    sortState: SortState<T>,
    getFieldValue: (item: TData, field: T) => string | number
  ): TData[] => {
    return [...data].sort((a, b) => {
      const aValue = getFieldValue(a, sortState.field);
      const bValue = getFieldValue(b, sortState.field);

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortState.direction === "asc" ? comparison : -comparison;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        const comparison = aValue - bValue;
        return sortState.direction === "asc" ? comparison : -comparison;
      }

      // Handle mixed types or nulls
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  };

  return { handleSort, sortData };
}

/**
 * Specific implementation for player table sorting
 */
export type PlayerSortField = "name" | "rank";

export interface PlayerForSorting {
  id: number;
  rank: number | null;
  player: {
    name: string;
    id: number;
  };
}

export function sortPlayers(
  players: PlayerForSorting[],
  sortState: SortState<PlayerSortField>
): PlayerForSorting[] {
  const { sortData } = createTableSorter<PlayerSortField>();

  return sortData(players, sortState, (player, field) => {
    switch (field) {
      case "name":
        return player.player.name;
      case "rank":
        // Handle null ranks - put them at the end for ascending, beginning for descending
        if (player.rank === null) {
          return sortState.direction === "asc"
            ? Number.MAX_SAFE_INTEGER
            : Number.MIN_SAFE_INTEGER;
        }
        return player.rank;
      default:
        return "";
    }
  });
}

/**
 * Get sort icon for table headers
 */
export function getSortIcon(
  currentField: string,
  targetField: string,
  direction: SortDirection
): "↑" | "↓" | "" {
  if (currentField !== targetField) return "";
  return direction === "asc" ? "↑" : "↓";
}
