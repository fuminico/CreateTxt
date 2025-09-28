import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
