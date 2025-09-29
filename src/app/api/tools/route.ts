import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: {
        // カテゴリ名でソートし、同じカテゴリが隣り合うようにする
        category: 'asc',
      },
    });

    // 取得したツールをカテゴリごとにグループ化する
    const groupedTools = tools.reduce((acc, tool) => {
      const category = tool.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>); // { "カテゴリ名": [tool, ...], ... }

    return NextResponse.json(groupedTools);
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    return NextResponse.json({ error: 'ツールの取得に失敗しました。' }, { status: 500 });
  }
}