import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import isOddNumber from "@/lib/utils/isOddNumber";
import { sortSeasonsChronologically } from "@/lib/utils/seasonSorting";
import { calculatePlayerStats, formatRatingChange, formatAverageChangePerSeason } from "@/lib/utils/playerStats";
import { GLASSY_CONTAINER_CLASSES } from "@/lib/utils/styles";
import PlayerGenderEditor from "@/app/components/PlayerGenderEditor";
import { revalidatePath } from "next/cache";

export default async function Player({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      gender: true,
      seasons: {
        include: {
          season: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  async function updatePlayerGender(playerId: number, gender: string | null) {
    "use server";
    
    try {
      await prisma.player.update({
        where: { id: playerId },
        data: { 
          gender: gender === null ? null : gender as any // Cast to Gender enum
        },
      });
      
      revalidatePath(`/players/${playerId}`);
    } catch (error) {
      console.error("Failed to update player gender:", error);
      throw new Error("Failed to update gender");
    }
  }

  // Sort seasons chronologically (most recent first)
  const sortedSeasons = sortSeasonsChronologically(
    player.seasons, 
    (seasonRanking) => seasonRanking.season.name
  );

  // Calculate player statistics
  const playerStats = calculatePlayerStats(player.seasons);

  // Prepare data for ranking visualization
  const rankingData = sortedSeasons.map((season, index) => ({
    index,
    season: season.season.name,
    rank: season.rank ? parseFloat(season.rank.toString()) : null,
  }));

  return (
    <div className="min-h-screen flex flex-col items-center pt-8">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{player.name}</h1>
      
      {player.seasons.length === 0 ? (
        <p className="text-gray-600">This player is not part of any seasons yet.</p>
      ) : (
        <>
          {/* Player Statistics Overview */}
          <div className="mb-8 w-full max-w-4xl px-4">
            <h2 className="text-2xl font-bold mb-4 text-[#333333] text-center">Player Statistics</h2>
            <div className={`${GLASSY_CONTAINER_CLASSES} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
              {/* Total Seasons */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {playerStats.totalSeasons}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Total Seasons
                </div>
              </div>

              {/* First Season */}
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {playerStats.firstSeason || "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  First Season
                </div>
              </div>

              {/* Most Recent Season */}
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {playerStats.mostRecentSeason || "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Most Recent Season
                </div>
              </div>

              {/* Average Rating */}
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {playerStats.averageRating !== null ? playerStats.averageRating.toFixed(2) : "N/A"}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Average Rating
                </div>
              </div>

              {/* Rating Change */}
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${formatRatingChange(playerStats.ratingChange).className}`}>
                  {formatRatingChange(playerStats.ratingChange).text}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Rating Change
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (First to Latest)
                </div>
              </div>

              {/* Average Change per Season */}
              <div className="text-center">
                <div className={`text-2xl font-bold mb-2 ${formatAverageChangePerSeason(playerStats.averageChangePerSeason).className}`}>
                  {formatAverageChangePerSeason(playerStats.averageChangePerSeason).text}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Average Change per Season
                </div>
              </div>
            </div>
          </div>

          {/* Player Gender Editor */}
          <div className="mb-8 w-full max-w-md px-4">
            <PlayerGenderEditor
              playerId={player.id}
              currentGender={player.gender}
              onUpdate={updatePlayerGender}
            />
          </div>

          {/* Ranking Over Time Visualization */}
          <div className="mb-8 w-full max-w-4xl px-4">
            <h3 className="text-2xl font-bold mb-4 text-[#333333] text-center">Rating Over Time</h3>
            <div className={GLASSY_CONTAINER_CLASSES}>
              <div className="space-y-4">
                {rankingData.map((data, index) => (
                  <div key={index} className="flex items-center">
                    {/* Season name (left side) */}
                    <div className="w-32 text-right pr-4 text-sm font-medium text-gray-700">
                      {data.season}
                    </div>
                    
                    {/* Bar and ranking display */}
                    <div className="flex-1 flex items-center">
                      {data.rank === null ? (
                        <>
                          <div className="w-8 h-6 bg-gray-400/50 rounded mr-3 flex items-center justify-center">
                            <span className="text-xs text-gray-600">-</span>
                          </div>
                          <span className="text-xs text-gray-500">No rank</span>
                        </>
                      ) : (
                        <>
                          {/* Horizontal bar */}
                          <div 
                            className="h-6 bg-blue-500/70 rounded border border-blue-600/50 hover:bg-blue-600/80 transition-colors cursor-pointer mr-3"
                            style={{ width: `${(data.rank / 10) * 300}px` }}
                            title={`${data.season}: Rank ${data.rank}`}
                          />
                          {/* Rank number */}
                          <span className="text-sm font-semibold text-gray-700">
                            Rank {data.rank}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-gray-300/50">
                  <div className="text-xs text-gray-600 text-center">
                    1 being lowest rating, 10 being highest rating
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seasons Table */}
          <h3 className="text-2xl font-bold mb-4 text-[#333333]">Season Details</h3>
          <table className="table-fixed w-3/4 border-2 border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-300 border-2 w-2/3">
                  <div className="px-2 py-2">Season Name</div>
                </th>
                <th className="bg-gray-300 border-2 w-1/3">
                  <div className="px-2 py-2">Rank</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSeasons.map((season, index) => (
                <tr key={season.id}>
                  <td className={`${
                    isOddNumber(index) ? "bg-gray-300" : ""
                  } border-2 px-2`}>
                    <Link 
                      href={`/seasons/${season.season.id}`}
                    >
                      {season.season.name}
                    </Link>
                  </td>
                  <td className={`${
                    isOddNumber(index) ? "bg-gray-300" : ""
                  } border-2 p-2 text-center`}>
                    {season.rank ? 
                      parseFloat(season.rank.toString()).toString() : 
                      "No rank"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
