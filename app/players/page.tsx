import prisma from "@/lib/prisma";
import Link from "next/link";

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
              <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <Link
                  href={`/players/${player.id}`}
                  className="text-[#333333] hover:text-blue-600 transition-colors font-medium block"
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
