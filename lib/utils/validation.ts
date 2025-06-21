/**
 * Validation utilities for player rankings
 */

/**
 * Validate that a rank is within the valid range and has proper decimal places
 * @param rank - The rank to validate
 * @throws Error if validation fails
 */
export function validateRank(rank: number): void {
  // Validate that rank is between 1 and 10
  if (rank < 1 || rank > 10) {
    throw new Error("Rank must be between 1 and 10");
  }

  // Validate that rank has at most 2 decimal places
  const decimalPlaces = (rank.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    throw new Error("Rank can have at most 2 decimal places");
  }
}

/**
 * Check if a name already exists in the database (case-insensitive)
 * @param prisma - Prisma client instance
 * @param name - Name to check
 * @param model - The model to check (player or season)
 * @returns Promise<boolean> - True if name exists
 */
export async function checkNameExists(
  prisma: any,
  name: string,
  model: 'player' | 'season'
): Promise<boolean> {
  const trimmedName = name.trim();
  
  const existingRecord = await prisma[model].findFirst({
    where: {
      name: {
        equals: trimmedName,
        mode: 'insensitive', // Case-insensitive comparison
      },
    },
  });

  return !!existingRecord;
}

/**
 * Validate and throw error if name already exists
 * @param prisma - Prisma client instance
 * @param name - Name to check
 * @param model - The model to check (player or season)
 * @throws Error if name exists
 */
export async function validateUniqueName(
  prisma: any,
  name: string,
  model: 'player' | 'season'
): Promise<void> {
  const exists = await checkNameExists(prisma, name, model);
  
  if (exists) {
    const entityType = model === 'player' ? 'player' : 'season';
    throw new Error(`A ${entityType} with the name "${name.trim()}" already exists`);
  }
}
