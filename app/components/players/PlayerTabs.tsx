"use client";

import { useState } from "react";
import { type PlayerWithRatings } from "@/lib/utils/genderUtils";
import PlayerList from "./PlayerList";
import PlayerStats from "./PlayerStats";

interface PlayerTabsProps {
  players: PlayerWithRatings[];
}

export default function PlayerTabs({ players }: PlayerTabsProps) {
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");

  return (
    <div className="w-full max-w-6xl px-4">
      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Tab Content */}
      {activeTab === "list" ? (
        <PlayerList players={players} />
      ) : (
        <PlayerStats players={players} />
      )}
    </div>
  );
}

interface TabNavigationProps {
  activeTab: "list" | "stats";
  onTabChange: (tab: "list" | "stats") => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex mb-8 bg-white/30 backdrop-blur-md rounded-lg p-1 border border-white/40">
      <button
        onClick={() => onTabChange("list")}
        className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-200 ${
          activeTab === "list"
            ? "bg-white/70 text-gray-900 shadow-md"
            : "text-gray-700 hover:bg-white/40"
        }`}
      >
        Player List
      </button>
      <button
        onClick={() => onTabChange("stats")}
        className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-200 ${
          activeTab === "stats"
            ? "bg-white/70 text-gray-900 shadow-md"
            : "text-gray-700 hover:bg-white/40"
        }`}
      >
        Statistics
      </button>
    </div>
  );
}
