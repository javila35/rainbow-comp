import prisma from "@/lib/prisma";
import PlayerTabs from "@/app/components/PlayerTabs";
import { requireRole } from "@/lib/utils/server-auth";
import { HEADING_H1, PAGE_CONTAINER } from "@/lib/utils/styles";

export default async function Players() {
  await requireRole("ORGANIZER");

  const playersData = await prisma.player.findMany({
    select: {
      id: true,
      name: true,
      gender: true,
      seasons: {
        select: {
          rank: true,
        },
      },
    },
  });

  // Convert Decimal ranks to numbers for client component compatibility
  const players = playersData.map(player => ({
    ...player,
    seasons: player.seasons.map(season => ({
      rank: season.rank ? Number(season.rank) : null,
    })),
  }));

  return (
    <div className={PAGE_CONTAINER}>
      <h1 className={`${HEADING_H1} mb-8`}>
        Players
      </h1>
      
      {players.length === 0 ? (
        <p className="text-gray-600">No players created yet.</p>
      ) : (
        <PlayerTabs players={players} />
      )}
    </div>
  );
}
