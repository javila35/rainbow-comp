import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import SeasonPlayerManager from "@/app/components/SeasonPlayerManager";
import SeasonStatistics from "@/app/components/SeasonStatistics";
import { Decimal } from "@prisma/client/runtime/library";
import { validateRank, validateUniqueName } from "@/lib/utils/validation";

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
            select: { 
              name: true, 
              id: true,
              gender: true 
            },
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
    rank: number,
  ) {
    "use server";

    validateRank(rank);

    try {
      // Use Decimal to avoid floating-point precision issues
      const decimalRank = new Decimal(rank.toString());
      
      await prisma.seasonRanking.update({
        where: { seasonId_playerId: { seasonId, playerId } },
        data: { rank: decimalRank },
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

      // Check if a player with this name already exists
      await validateUniqueName(prisma, playerName, 'player');

      // Create the new player
      const newPlayer = await prisma.player.create({
        data: {
          name: playerName.trim(),
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

      return newPlayer.id; // Return the new player's ID
    } catch (error) {
      console.error("Failed to create and add player:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create player");
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
    <div className="min-h-screen flex flex-col items-center pt-8">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{season.name}</h1>

      {/* Season Statistics */}
      <div className="mb-8">
        <SeasonStatistics 
          players={season.players.map((player) => ({
            ...player,
            rank: player.rank ? parseFloat(player.rank.toString()) : null,
          }))}
          seasonName={season.name}
        />
      </div>

      {/* Season Player Manager */}
      <SeasonPlayerManager
        seasonId={parseInt(id)}
        players={season.players.map((player) => ({
          ...player,
          rank: player.rank ? parseFloat(player.rank.toString()) : null,
        }))}
        availablePlayers={availablePlayers}
        onPlayerAdd={addPlayerToSeason}
        onPlayerCreate={createPlayerAndAddToSeason}
        onRankUpdate={updatePlayerRanking}
        onRemove={removePlayerFromSeason}
      />
    </div>
  );
}
