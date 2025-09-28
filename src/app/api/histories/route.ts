import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const histories = await prisma.history.findMany({
      // 関連するToolの情報を取得する
      include: {
        tool: {
          select: {
            title: true,
          },
        },
      },
      // 新しい履歴が上にくるように降順でソート
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(histories);
  } catch (error) {
    console.error('[/api/histories] Error:', error);
    return NextResponse.json({ error: '履歴の取得に失敗しました。' }, { status: 500 });
  }
}
