import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/utils/server-auth';
import { validateRank } from '@/lib/utils/validation';
import { Decimal } from '@prisma/client/runtime/library';

interface UpdateRankingRequest {
  seasonId: number;
  playerName: string;
  newRank: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and role
    await requireRole("ORGANIZER");

    const body: UpdateRankingRequest = await request.json();
    const { seasonId, playerName, newRank } = body;

    // Validate input
    if (!seasonId || !playerName || newRank === undefined) {
      return NextResponse.json(
        { error: 'Season ID, player name, and new rank are required' },
        { status: 400 }
      );
    }

    // Validate rank
    validateRank(newRank);

    // Find the player
    const player = await prisma.player.findUnique({
      where: { name: playerName.trim() }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Update the ranking
    const decimalRank = new Decimal(newRank.toString());
    
    await prisma.seasonRanking.update({
      where: {
        seasonId_playerId: {
          seasonId,
          playerId: player.id
        }
      },
      data: {
        rank: decimalRank
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${playerName}'s ranking to ${newRank}`,
      playerName,
      newRank
    });

  } catch (error) {
    console.error('Error updating ranking:', error);
    
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
