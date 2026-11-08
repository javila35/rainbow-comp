"use client";

import { GLASSY_CONTAINER_CLASSES } from "@/lib/utils/styles";
import { calculatePlayerStatistics, type PlayerWithRatings } from "@/lib/utils/genderUtils";

interface PlayerStatsProps {
  players: PlayerWithRatings[];
}

export default function PlayerStats({ players }: PlayerStatsProps) {
  const statistics = calculatePlayerStatistics(players);

  return (
    <div className="space-y-8">
      {/* Gender Rating Averages */}
      <div className={GLASSY_CONTAINER_CLASSES}>
        <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
          Average Ratings by Gender
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            value={statistics.male.averageRating?.toFixed(2) || "N/A"}
            label="Male Average"
            count={statistics.male.playerCount}
            colorClass="text-blue-600"
          />
          <StatCard
            value={statistics.female.averageRating?.toFixed(2) || "N/A"}
            label="Female Average"
            count={statistics.female.playerCount}
            colorClass="text-pink-600"
          />
          <StatCard
            value={statistics.nonBinary.averageRating?.toFixed(2) || "N/A"}
            label="Non-Binary Average"
            count={statistics.nonBinary.playerCount}
            colorClass="text-purple-600"
          />
          <StatCard
            value={statistics.unspecified.averageRating?.toFixed(2) || "N/A"}
            label="Unspecified Average"
            count={statistics.unspecified.playerCount}
            colorClass="text-gray-600"
          />
        </div>
      </div>

      {/* Gender Distribution */}
      <div className={GLASSY_CONTAINER_CLASSES}>
        <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
          Player Distribution by Gender
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PercentageCard
            percentage={statistics.male.percentage}
            label="Male"
            count={statistics.male.playerCount}
            total={statistics.totalPlayers}
            colorClass="text-blue-600"
          />
          <PercentageCard
            percentage={statistics.female.percentage}
            label="Female"
            count={statistics.female.playerCount}
            total={statistics.totalPlayers}
            colorClass="text-pink-600"
          />
          <PercentageCard
            percentage={statistics.nonBinary.percentage}
            label="Non-Binary"
            count={statistics.nonBinary.playerCount}
            total={statistics.totalPlayers}
            colorClass="text-purple-600"
          />
          <PercentageCard
            percentage={statistics.unspecified.percentage}
            label="Unspecified"
            count={statistics.unspecified.playerCount}
            total={statistics.totalPlayers}
            colorClass="text-gray-600"
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className={GLASSY_CONTAINER_CLASSES}>
        <h3 className="text-xl font-bold mb-6 text-[#333333] text-center">
          Overall Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statistics.totalPlayers}
            </div>
            <div className="text-sm text-gray-700 font-medium">
              Total Players
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {players.filter((p) => p.seasons.some((s) => s.rank !== null)).length}
            </div>
            <div className="text-sm text-gray-700 font-medium">
              Ranked Players
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {players.filter((p) => p.gender === null).length}
            </div>
            <div className="text-sm text-gray-700 font-medium">
              Gender Not Set
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  value: string;
  label: string;
  count: number;
  colorClass: string;
}

function StatCard({ value, label, count, colorClass }: StatCardProps) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold mb-2 ${colorClass}`}>
        {value}
      </div>
      <div className="text-sm text-gray-700 font-medium">
        {label}
      </div>
      <div className="text-xs text-gray-500">
        ({count} players)
      </div>
    </div>
  );
}

interface PercentageCardProps {
  percentage: number;
  label: string;
  count: number;
  total: number;
  colorClass: string;
}

function PercentageCard({ percentage, label, count, total, colorClass }: PercentageCardProps) {
  return (
    <div className="text-center">
      <div className={`text-4xl font-bold mb-2 ${colorClass}`}>
        {percentage}%
      </div>
      <div className="text-sm text-gray-700 font-medium">{label}</div>
      <div className="text-xs text-gray-500">
        {count} of {total}
      </div>
    </div>
  );
}