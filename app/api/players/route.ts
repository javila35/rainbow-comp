import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/utils/server-auth';
import { validateUniqueName } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and role
    await requireRole("ORGANIZER");

    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // Check if a player with this name already exists
    await validateUniqueName(prisma, trimmedName, "player");

    // Create the new player
    const newPlayer = await prisma.player.create({
      data: {
        name: trimmedName,
        gender: null // Will be set later if needed
      }
    });

    return NextResponse.json({
      success: true,
      player: {
        id: newPlayer.id,
        name: newPlayer.name
      }
    });

  } catch (error) {
    console.error('Error creating player:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized - insufficient role' },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
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
