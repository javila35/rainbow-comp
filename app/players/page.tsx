import prisma from "@/lib/prisma";
import PlayerTabs from "@/app/components/PlayerTabs";

export default async function Players() {
  const players = await prisma.player.findMany({
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

  return (
    <div className="min-h-screen flex flex-col items-center pt-8">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
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
