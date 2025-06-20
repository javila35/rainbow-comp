import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{player.name}</h1>
      <h3 className="text-2xl font-bold mb-4 text-[#333333]">Seasons</h3>
      <ul className="font-[family-name:var(--font-geist-sans)] max-w-2xl space-y-4">
        {player.seasons.map((season) => (
          <li key={season.id} className="mb-2">
            {season.season.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
