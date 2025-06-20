import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

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
                    select: { name: true, id: true }
                }
            }
        }
    }
  })

  if (!season) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{season.name}</h1>
      <h3 className="text-2xl font-bold mb-4 text-[#333333]">Seasons</h3>
      <ul className="font-[family-name:var(--font-geist-sans)] max-w-2xl space-y-4">
        {season.players.map((player) => (
          <li key={season.id} className="mb-2">
            {player.player.name} {player.rank ? `(${player.rank})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
