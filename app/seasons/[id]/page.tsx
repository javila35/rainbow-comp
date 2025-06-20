import prisma from "@/lib/prisma";
import isOddNumber from "@/lib/utils/isOddNumber";
import { notFound } from "next/navigation";
import RankingInput from "@/app/components/RankingInput";
import PlayerSearch from "@/app/components/PlayerSearch";
import DeletePlayerButton from "@/app/components/DeletePlayerButton";

export default async function Season({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get season with players
  const season = await prisma.season.findUnique({
    where: { id: parseInt(id) },
    include: {
      players: {
        select: {
          id: true,
          rank: true,
          player: {
            select: { name: true, id: true },
          },
        },
      },
    },
  });

  // Get all players not in this season
  const playersInSeason = season?.players.map((p) => p.player.id) || [];
  const availablePlayers = await prisma.player.findMany({
    where: {
      id: {
        notIn: playersInSeason,
      },
    },
    select: {
      id: true,
      name: true,
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

    // Validate that rank has at most 2 decimal places
    const decimalPlaces = (rank.toString().split(".")[1] || "").length;
    if (decimalPlaces > 2) {
      throw new Error("Rank can have at most 2 decimal places");
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
  async function addPlayerToSeason(playerId: number) {
    "use server";

    try {
      const seasonId = parseInt(id);

      // Check if player is already in the season
      const existingRanking = await prisma.seasonRanking.findUnique({
        where: {
          seasonId_playerId: {
            seasonId: seasonId,
            playerId: playerId,
          },
        },
      });

      if (existingRanking) {
        throw new Error("Player is already in this season");
      }

      await prisma.seasonRanking.create({
        data: {
          seasonId: seasonId,
          playerId: playerId,
          // rank is optional, so we don't set it initially
        },
      });

      // Use revalidatePath instead of redirect for better UX
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/seasons/${id}`);
    } catch (error) {
      console.error("Failed to add player to season:", error);
      throw new Error("Failed to add player");
    }
  }
  async function createPlayerAndAddToSeason(playerName: string) {
    "use server";

    try {
      const seasonId = parseInt(id);

      // Create the new player
      const newPlayer = await prisma.player.create({
        data: {
          name: playerName,
        },
      });

      // Add the new player to the season
      await prisma.seasonRanking.create({
        data: {
          seasonId: seasonId,
          playerId: newPlayer.id,
          // rank is optional, so we don't set it initially
        },
      });

      // Refresh the page data
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/seasons/${id}`);
    } catch (error) {
      console.error("Failed to create and add player:", error);
      throw new Error("Failed to create player");
    }
  }

  async function removePlayerFromSeason(playerId: number) {
    "use server";

    try {
      const seasonId = parseInt(id);

      await prisma.seasonRanking.delete({
        where: {
          seasonId_playerId: {
            seasonId: seasonId,
            playerId: playerId,
          },
        },
      });

      // Refresh the page data
      const { revalidatePath } = await import("next/cache");
      revalidatePath(`/seasons/${id}`);
    } catch (error) {
      console.error("Failed to remove player from season:", error);
      throw new Error("Failed to remove player");
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{season.name}</h1>
      {/* Add Player Search */}
      <div className="mb-8 w-full max-w-md">
        {" "}
        <PlayerSearch
          seasonId={parseInt(id)}
          onPlayerAdd={addPlayerToSeason}
          onPlayerCreate={createPlayerAndAddToSeason}
          availablePlayers={availablePlayers}
        />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-[#333333]">
        Current Players
      </h3>{" "}
      <table className="table-fixed w-3/4 border-2 border-collapse">
        <thead>
          <tr>
            <th className="bg-gray-300 border-2 w-1/2">Player Name</th>
            <th className="bg-gray-300 border-2 w-1/3">Rank</th>
            <th className="bg-gray-300 border-2 w-1/6"></th>
          </tr>
        </thead>
        <tbody>
          {season.players.map((player, index) => (
            <tr key={player.id}>
              <td
                className={`${
                  isOddNumber(index) ? "bg-gray-300" : ""
                } border-2 px-2`}
              >
                {player.player.name}
              </td>
              <td
                className={`${
                  isOddNumber(index) ? "bg-gray-300" : ""
                } border-2 p-2`}
              >
                <RankingInput
                  playerId={player.player.id}
                  seasonId={parseInt(id)}
                  initialRank={player.rank}
                  onRankUpdate={updatePlayerRanking}
                />
              </td>
              <td
                className={`${
                  isOddNumber(index) ? "bg-gray-300" : ""
                } border-2 p-2 text-center`}
              >
                <DeletePlayerButton
                  playerName={player.player.name}
                  playerId={player.player.id}
                  onRemove={removePlayerFromSeason}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
