import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function Seasons() {
  const seasons = await prisma.season.findMany();

  // Sort seasons by year (descending) then by season name
  const sortedSeasons = seasons.sort((a, b) => {
    // Extract year and season from the format "[SEASON] [YEAR]"
    const parseSeasonName = (name: string) => {
      const parts = name.trim().split(' ');
      const year = parseInt(parts[parts.length - 1]) || 0; // Last part should be year
      const season = parts.slice(0, -1).join(' '); // Everything except last part
      return { year, season };
    };

    const seasonA = parseSeasonName(a.name);
    const seasonB = parseSeasonName(b.name);

    // First sort by year (descending)
    if (seasonA.year !== seasonB.year) {
      return seasonB.year - seasonA.year;
    }

    // Then sort by season name (alphabetically)
    return seasonA.season.localeCompare(seasonB.season);
  });

  async function createSeason(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    
    if (!name || name.trim() === "") {
      throw new Error("Season name is required");
    }

    try {
      // Check if a season with this name already exists
      const existingSeason = await prisma.season.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive', // Case-insensitive comparison
          },
        },
      });

      if (existingSeason) {
        throw new Error(`A season with the name "${name.trim()}" already exists`);
      }

      await prisma.season.create({
        data: {
          name: name.trim(),
        },
      });

      revalidatePath("/seasons");
    } catch (error) {
      console.error("Failed to create season:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create season");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-8">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Seasons
      </h1>

      {/* Add New Season Form */}
      <div className="mb-8 w-full max-w-md">
        <form action={createSeason} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Enter new season name..."
              required
              className="w-full px-4 py-2 bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200 placeholder-gray-700 text-gray-900 font-medium shadow-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-white/40 backdrop-blur-md border-2 border-white/60 text-gray-900 rounded-lg hover:bg-white/50 hover:border-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-xl"
          >
            Add Season
          </button>
        </form>
      </div>

      <h3 className="text-2xl font-bold mb-4 text-[#333333]">
        Existing Seasons
      </h3>

      {sortedSeasons.length === 0 ? (
        <p className="text-gray-600">No seasons created yet.</p>
      ) : (
        <div className="w-full max-w-6xl px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedSeasons.map((season) => (
              <div key={season.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <Link
                  href={`/seasons/${season.id}`}
                  className="text-[#333333] hover:text-blue-600 transition-colors font-medium block"
                >
                  {season.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
