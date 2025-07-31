import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { sortSeasonsChronologically } from "@/lib/utils/seasonSorting";
import { validateUniqueName } from "@/lib/utils/validation";
import { GLASSY_INPUT_CLASSES, GLASSY_BUTTON_CLASSES, CARD_CLASSES, CARD_LINK_CLASSES, HEADING_H1, HEADING_H3, PAGE_CONTAINER, CONTENT_CONTAINER, GRID_CONTAINER } from "@/lib/utils/styles";
import { requireRole } from "@/lib/utils/server-auth";

export default async function Seasons() {
  await requireRole("ORGANIZER");

  const seasons = await prisma.season.findMany();

  const sortedSeasons = sortSeasonsChronologically(seasons, (season) => season.name);

  async function createSeason(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    
    if (!name || name.trim() === "") {
      throw new Error("Season name is required");
    }

    try {
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
    <div className={PAGE_CONTAINER}>
      <h1 className={`${HEADING_H1} mb-8`}>
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

      <h3 className={`${HEADING_H3} mb-4`}>
        Existing Seasons
      </h3>

      {sortedSeasons.length === 0 ? (
        <p className="text-gray-600">No seasons created yet.</p>
      ) : (
        <div className={CONTENT_CONTAINER}>
          <div className={GRID_CONTAINER}>
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
