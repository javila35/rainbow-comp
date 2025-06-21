"use client";

import { useState } from "react";
import { GLASSY_BUTTON_CLASSES } from "@/lib/utils/styles";

interface PlayerGenderEditorProps {
  playerId: number;
  currentGender: string | null;
  onUpdate: (playerId: number, gender: string | null) => Promise<void>;
}

type Gender = "MALE" | "FEMALE" | "NON_BINARY" | null;

const genderLabels: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female", 
  NON_BINARY: "Non-Binary",
};

export default function PlayerGenderEditor({ 
  playerId, 
  currentGender, 
  onUpdate 
}: PlayerGenderEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender>(
    currentGender as Gender
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(playerId, selectedGender);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update gender:", error);
      // Reset to current gender on error
      setSelectedGender(currentGender as Gender);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setSelectedGender(currentGender as Gender);
    setIsEditing(false);
  };

  const displayGender = currentGender ? genderLabels[currentGender] : "Not specified";

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/40">
        <div>
          <span className="text-sm text-gray-700 font-medium">Gender: </span>
          <span className="text-gray-800 font-semibold">{displayGender}</span>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm bg-blue-500/70 hover:bg-blue-600/80 text-white rounded-md transition-colors"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/40 backdrop-blur-md rounded-lg border border-white/50">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Gender:
        </label>
        <div className="space-y-2">
          {/* None/Unspecified Option */}
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value=""
              checked={selectedGender === null}
              onChange={() => setSelectedGender(null)}
              className="mr-2"
            />
            <span className="text-gray-700">Not specified</span>
          </label>
          
          {/* Gender Options */}
          {Object.entries(genderLabels).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={value}
                checked={selectedGender === value}
                onChange={() => setSelectedGender(value as Gender)}
                className="mr-2"
              />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className={`flex-1 ${GLASSY_BUTTON_CLASSES} disabled:opacity-50`}
        >
          {isUpdating ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isUpdating}
          className="flex-1 px-4 py-2 bg-gray-400/40 backdrop-blur-md border-2 border-gray-400/60 text-gray-900 rounded-lg hover:bg-gray-400/50 hover:border-gray-400/70 transition-all duration-200 font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
