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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">{player.name}</h1>
      <h3 className="text-2xl font-bold mb-4 text-[#333333]">Seasons</h3>
      
      {player.seasons.length === 0 ? (
        <p className="text-gray-600">This player is not part of any seasons yet.</p>
      ) : (
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
            {player.seasons.map((season, index) => (
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
      )}
    </div>
  );
}
