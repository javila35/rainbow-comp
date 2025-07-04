/**
 * Server action utilities for player and season management
 */

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";
import { validateRank, validateUniqueName } from "./validation";

/**
 * Update a player's gender
 */
export async function updatePlayerGender(
  playerId: number,
  gender: string | null
) {
  "use server";

  try {
    await prisma.player.update({
      where: { id: playerId },
      data: {
        gender: gender === null ? null : (gender as any), // Cast to Gender enum
      },
    });

    revalidatePath(`/players/${playerId}`);
  } catch (error) {
    console.error("Failed to update player gender:", error);
    throw new Error("Failed to update gender");
  }
}

/**
 * Update a player's ranking in a season
 */
export async function updatePlayerRanking(
  playerId: number,
  seasonId: number,
  rank: number
) {
  "use server";

  validateRank(rank);

  try {
    // Use Decimal to avoid floating-point precision issues
    const decimalRank = new Decimal(rank.toString());

    await prisma.seasonRanking.update({
      where: { seasonId_playerId: { seasonId, playerId } },
      data: { rank: decimalRank },
    });

    revalidatePath(`/seasons/${seasonId}`);
  } catch (error) {
    console.error("Failed to update player ranking:", error);
    throw new Error("Failed to update ranking");
  }
}

/**
 * Add a player to a season
 */
export async function addPlayerToSeason(playerId: number, seasonId: number) {
  "use server";

  try {
    await prisma.seasonRanking.create({
      data: {
        playerId,
        seasonId,
        rank: null, // No rank initially
      },
    });

    revalidatePath(`/seasons/${seasonId}`);
  } catch (error) {
    console.error("Failed to add player to season:", error);
    throw new Error("Failed to add player to season");
  }
}

/**
 * Remove a player from a season
 */
export async function removePlayerFromSeason(
  playerId: number,
  seasonId: number
) {
  "use server";

  try {
    await prisma.seasonRanking.delete({
      where: {
        seasonId_playerId: {
          seasonId,
          playerId,
        },
      },
    });

    revalidatePath(`/seasons/${seasonId}`);
  } catch (error) {
    console.error("Failed to remove player from season:", error);
    throw new Error("Failed to remove player from season");
  }
}

/**
 * Create a new player and optionally add to a season
 */
export async function createPlayer(name: string, seasonId?: number) {
  "use server";

  if (!name || name.trim() === "") {
    throw new Error("Player name is required");
  }

  try {
    // Check if player with this name already exists
    await validateUniqueName(prisma, name, "player");

    const player = await prisma.player.create({
      data: {
        name: name.trim(),
      },
    });

    // If seasonId is provided, add the player to that season
    if (seasonId) {
      await prisma.seasonRanking.create({
        data: {
          playerId: player.id,
          seasonId,
          rank: null,
        },
      });
      revalidatePath(`/seasons/${seasonId}`);
    }

    revalidatePath("/players");
    return player.id;
  } catch (error) {
    console.error("Failed to create player:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create player"
    );
  }
}

/**
 * Create a new season
 */
export async function createSeason(name: string) {
  "use server";

  if (!name || name.trim() === "") {
    throw new Error("Season name is required");
  }

  try {
    // Check if a season with this name already exists
    await validateUniqueName(prisma, name, "season");

    const season = await prisma.season.create({
      data: {
        name: name.trim(),
      },
    });

    revalidatePath("/seasons");
    return season.id;
  } catch (error) {
    console.error("Failed to create season:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create season"
    );
  }
}
