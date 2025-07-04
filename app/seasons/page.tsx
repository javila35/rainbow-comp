import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { sortSeasonsChronologically } from "@/lib/utils/seasonSorting";
import { validateUniqueName } from "@/lib/utils/validation";
import { GLASSY_INPUT_CLASSES, GLASSY_BUTTON_CLASSES, CARD_CLASSES, CARD_LINK_CLASSES } from "@/lib/utils/styles";
import { requireRole } from "@/lib/utils/server-auth";

export default async function Seasons() {
  await requireRole("ORGANIZER");

  const seasons = await prisma.season.findMany();

  // Sort seasons chronologically (most recent first)
  const sortedSeasons = sortSeasonsChronologically(seasons, (season) => season.name);

  async function createSeason(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    
    if (!name || name.trim() === "") {
      throw new Error("Season name is required");
    }

    try {
      // Check if a season with this name already exists
      await validateUniqueName(prisma, name, 'season');

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
              className={GLASSY_INPUT_CLASSES}
            />
          </div>
          <button
            type="submit"
            className={GLASSY_BUTTON_CLASSES}
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
              <div key={season.id} className={CARD_CLASSES}>
                <Link
                  href={`/seasons/${season.id}`}
                  className={CARD_LINK_CLASSES}
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
