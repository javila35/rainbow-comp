import prisma from "@/lib/prisma";
import isOddNumber from "@/lib/utils/isOddNumber";
import { notFound } from "next/navigation";
import RankingInput from "@/app/components/RankingInput";

export default async function Season({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const season = await prisma.season.findUnique({
    where: { id: parseInt(id) },
    include: {
      players: {
        include: {
          player: {
            select: { name: true, id: true },
          },
        },
      },
    },
  });
  if (!season) {
    notFound();
  }
  async function updatePlayerRanking(
    playerId: number,
    seasonId: number,
    rank: number
  ) {
    "use server";

    // Validate that rank is between 1 and 10
    if (rank < 1 || rank > 10) {
      throw new Error("Rank must be between 1 and 10");
    }

    // Validate that rank is a valid number
    if (!Number.isInteger(rank)) {
      throw new Error("Rank must be a whole number");
    }

    try {
      await prisma.seasonRanking.update({
        where: { seasonId_playerId: { seasonId, playerId } },
        data: { rank },
      });
    } catch (error) {
      console.error("Failed to update player ranking:", error);
      throw new Error("Failed to update ranking");
    }
  }

  console.log(season);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{season.name}</h1>
      <h3 className="text-2xl font-bold mb-4 text-[#333333]">Seasons</h3>
      <table className="table-fixed w-3/4 border-2 border-collapse">
        <thead>
          <tr>
            <th className="bg-gray-300 border-2">Player Name</th>
            <th className="bg-gray-300 border-2">Rank</th>
          </tr>
        </thead>
        <tbody>
          {season.players.map((player, index) => (
            <tr key={player.id}>
              <td
                className={`${
                  isOddNumber(index) ? "bg-gray-300" : ""
                } border-2`}
              >
                {player.player.name}
              </td>{" "}
              <td
                className={`${
                  isOddNumber(index) ? "bg-gray-300" : ""
                } border-2`}
              >
                <RankingInput
                  playerId={player.player.id}
                  seasonId={parseInt(id)}
                  initialRank={player.rank}
                  onRankUpdate={updatePlayerRanking}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
