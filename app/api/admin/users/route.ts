import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { hasRole } from '@/lib/utils/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check if user is authenticated and has JOE role
    const session = await auth();
    if (!session?.user || !hasRole(session.user.role, 'JOE')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is authenticated and has JOE role
    const session = await auth();
    if (!session?.user || !hasRole(session.user.role, 'JOE')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    // Validate the role
    if (!['USER', 'ORGANIZER', 'JOE'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent users from removing their own JOE role (to avoid lockout)
    if (session.user.id === userId && session.user.role === 'JOE' && role !== 'JOE') {
      return NextResponse.json({ 
        error: 'Cannot remove your own JOE role' 
      }, { status: 400 });
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
