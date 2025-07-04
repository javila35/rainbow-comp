import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/utils/server-auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and role
    await requireRole("ORGANIZER");

    const body = await request.json();
    const { playerIds, gender } = body;

    // Validate input
    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Player IDs must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate gender value
    const validGenders = ['MALE', 'FEMALE', 'NON_BINARY', null];
    if (gender !== null && !validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      );
    }

    // Update all players in a single transaction
    const updatedPlayers = await prisma.player.updateMany({
      where: {
        id: {
          in: playerIds.map(id => parseInt(id))
        }
      },
      data: {
        gender: gender
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: updatedPlayers.count,
      message: `Successfully updated ${updatedPlayers.count} player(s)`
    });

  } catch (error) {
    console.error('Error updating player genders:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized - insufficient role' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
