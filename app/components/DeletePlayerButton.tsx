"use client";

import { useState, useRef } from "react";

interface DeletePlayerButtonProps {
  playerName: string;
  playerId: number;
  onRemove: (playerId: number) => Promise<void>;
}

export default function DeletePlayerButton({
  playerName,
  playerId,
  onRemove,
}: DeletePlayerButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onRemove(playerId);
      setShowConfirm(false);
    } catch (error) {
      console.error("Failed to remove player:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowConfirm(true)}
        className="w-6 h-6 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
        title={`Remove ${playerName} from season`}
      >
        ✕
      </button>
      {showConfirm && (
        <>
          {/* Transparent blurred backdrop */}
          <div
            className="fixed inset-0 backdrop-blur-md z-40"
            onClick={handleCancel}
          />

          {/* Positioned dialog above the button */}
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <div className="bg-white rounded-lg shadow-xl p-3 w-48 border border-gray-200">
              <p className="text-xs text-gray-700 mb-2">
                Remove <strong>{playerName}</strong>?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isLoading ? "..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
