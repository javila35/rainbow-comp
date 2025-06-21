import prisma from "@/lib/prisma";
import Link from "next/link";
import { CARD_CLASSES, CARD_LINK_CLASSES } from "@/lib/utils/styles";

export default async function Players() {
  const players = await prisma.player.findMany();
  
  // Sort players alphabetically by name
  const sortedPlayers = players.sort((a, b) => 
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return (
    <div className="min-h-screen flex flex-col items-center pt-8">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Players
      </h1>
      
      {sortedPlayers.length === 0 ? (
        <p className="text-gray-600">No players created yet.</p>
      ) : (
        <div className="w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedPlayers.map((player) => (
              <div key={player.id} className={CARD_CLASSES}>
                <Link
                  href={`/players/${player.id}`}
                  className={CARD_LINK_CLASSES}
                >
                  {player.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
