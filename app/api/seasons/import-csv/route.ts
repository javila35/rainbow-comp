import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/utils/server-auth';
import { validateRank } from '@/lib/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

interface ImportPlayer {
  name: string;
  rank: number;
}

interface ImportResult {
  name: string;
  rank: number;
  success: boolean;
  action: 'added_to_season' | 'updated_ranking' | 'player_not_found';
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and role
    await requireRole("ORGANIZER");

    const body = await request.json();
    const { seasonId, players } = body;

    // Validate input
    if (!seasonId || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { error: 'Season ID and players array are required' },
        { status: 400 }
      );
    }

    // Validate seasonId exists
    const season = await prisma.season.findUnique({
      where: { id: parseInt(seasonId) }
    });

    if (!season) {
      return NextResponse.json(
        { error: 'Season not found' },
        { status: 404 }
      );
    }

    const results: ImportResult[] = [];
    let successCount = 0;

    // Process each player
    for (const playerData of players as ImportPlayer[]) {
      try {
        const { name, rank } = playerData;

        // Validate rank
        validateRank(rank);

        // Check if player exists in the database
        const player = await prisma.player.findUnique({
          where: { name: name.trim() }
        });

        if (!player) {
          // Player doesn't exist - add to results as not found
          results.push({
            name: name.trim(),
            rank,
            success: false,
            action: 'player_not_found',
            error: 'Player not found in database'
          });
          continue;
        }

        // Check if player is already in this season
        const existingRanking = await prisma.seasonRanking.findUnique({
          where: {
            seasonId_playerId: {
              seasonId: parseInt(seasonId),
              playerId: player.id
            }
          }
        });

        const decimalRank = new Decimal(rank.toString());

        if (existingRanking) {
          // Update existing ranking
          await prisma.seasonRanking.update({
            where: {
              seasonId_playerId: {
                seasonId: parseInt(seasonId),
                playerId: player.id
              }
            },
            data: {
              rank: decimalRank
            }
          });

          results.push({
            name: player.name,
            rank,
            success: true,
            action: 'updated_ranking'
          });
        } else {
          // Add player to season with ranking
          await prisma.seasonRanking.create({
            data: {
              seasonId: parseInt(seasonId),
              playerId: player.id,
              rank: decimalRank
            }
          });

          results.push({
            name: player.name,
            rank,
            success: true,
            action: 'added_to_season'
          });
        }

        successCount++;

      } catch (error) {
        console.error(`Error processing player ${playerData.name}:`, error);
        results.push({
          name: playerData.name,
          rank: playerData.rank,
          success: false,
          action: 'player_not_found',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successCount} out of ${players.length} players`,
      successCount,
      totalCount: players.length,
      results
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized - insufficient role' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
