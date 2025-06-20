import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Seasons() {
  const seasons = await prisma.season.findMany();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Seasons
      </h1>
      <ul className="font-[family-name:var(--font-geist-sans)] max-w-2xl space-y-4">
        {seasons.map((season) => (
          <li key={season.id} className="mb-2">
            <Link
              href={`/seasons/${season.id}`}
              className="text-[#333333] hover:text-gray-600 transition-colors"
            >
              {season.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
