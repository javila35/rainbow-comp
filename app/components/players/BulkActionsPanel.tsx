"use client";

import { GLASSY_CONTAINER_CLASSES, BUTTON_SECONDARY, BUTTON_PRIMARY } from "@/lib/utils/styles";

interface BulkActionsPanelProps {
  selectedCount: number;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onBulkUpdateGender: (playerIds: number[], gender: string | null) => void;
  selectedPlayerIds: number[];
  isPending: boolean;
}

export function BulkActionsPanel({
  selectedCount,
  onSelectAllFiltered,
  onClearSelection,
  onBulkUpdateGender,
  selectedPlayerIds,
  isPending
}: BulkActionsPanelProps) {
  const handleBulkGenderUpdate = (gender: string | null) => {
    if (selectedCount === 0) return;
    onBulkUpdateGender(selectedPlayerIds, gender);
  };

  return (
    <div className={`${GLASSY_CONTAINER_CLASSES} p-4 mb-6 border-l-4 border-blue-500`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Bulk Actions ({selectedCount} selected)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAllFiltered}
            className={`${BUTTON_SECONDARY} text-sm`}
          >
            Select All Filtered
          </button>
          <button
            onClick={onClearSelection}
            className={`${BUTTON_SECONDARY} text-sm`}
          >
            Clear All
          </button>
        </div>
      </div>

      {selectedCount > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Set gender for {selectedCount} selected player{selectedCount !== 1 ? "s" : ""}:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkGenderUpdate("MALE")}
              disabled={isPending}
              className={`${BUTTON_PRIMARY} disabled:opacity-50`}
            >
              Set to Male
            </button>
            <button
              onClick={() => handleBulkGenderUpdate("FEMALE")}
              disabled={isPending}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
            >
              Set to Female
            </button>
            <button
              onClick={() => handleBulkGenderUpdate("NON_BINARY")}
              disabled={isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Set to Non-Binary
            </button>
            <button
              onClick={() => handleBulkGenderUpdate(null)}
              disabled={isPending}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Clear Gender
            </button>
          </div>
        </div>
      )}
    </div>
  );
}