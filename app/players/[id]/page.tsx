import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import isOddNumber from "@/lib/utils/isOddNumber";

export default async function Player({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await prisma.player.findUnique({
    where: { id: parseInt(id) },
    include: {
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

  // Sort seasons chronologically (most recent first)
  const sortedSeasons = player.seasons.sort((a, b) => {
    const parseSeasonName = (name: string) => {
      const parts = name.trim().split(' ');
      const year = parseInt(parts[parts.length - 1]) || 0;
      const season = parts.slice(0, -1).join(' ');
      return { year, season };
    };

    const seasonA = parseSeasonName(a.season.name);
    const seasonB = parseSeasonName(b.season.name);

    // Define season order (Winter=0, Spring=1, Summer=2, Fall=3)
    const getSeasonOrder = (season: string) => {
      const seasonLower = season.toLowerCase();
      if (seasonLower.includes('winter')) return 0;
      if (seasonLower.includes('spring')) return 1;
      if (seasonLower.includes('summer')) return 2;
      if (seasonLower.includes('fall') || seasonLower.includes('autumn')) return 3;
      return 4; // For any other season names
    };

    // First sort by year (descending - most recent first)
    if (seasonA.year !== seasonB.year) {
      return seasonB.year - seasonA.year;
    }

    // Then sort by season order (Fall, Summer, Spring, Winter for same year)
    // For descending chronological order: Fall > Summer > Spring > Winter
    const orderA = getSeasonOrder(seasonA.season);
    const orderB = getSeasonOrder(seasonB.season);
    
    return orderB - orderA; // Descending order
  });

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
          {/* Ranking Over Time Visualization */}
          <div className="mb-8 w-full max-w-4xl px-4">
            <h3 className="text-2xl font-bold mb-4 text-[#333333] text-center">Ranking Over Time</h3>
            <div className="bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-lg p-6 shadow-lg">
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
                    Longer bars = Higher ratings (Rating 10 = longest, Rating 1 = shortest)
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
