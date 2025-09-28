import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ToolForm } from './components/ToolForm';
import type { PageProps } from 'next';

// サーバーコンポーネントとして非同期にデータを取得
export default async function ToolPage({ params }: PageProps<{ toolId: string }>) {
  // Next.js 15ではparamsがPromiseライクなオブジェクトになるため、awaitで解決します
  const resolvedParams = await params;
  const toolId = parseInt(resolvedParams.toolId, 10);

  if (isNaN(toolId)) {
    notFound();
  }

  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
  });

  if (!tool) {
    notFound();
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-pink-400 to-orange-300">{tool.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{tool.description}</p>
      </header>
      
      {/* 取得したデータをクライアントコンポーネントに渡す */}
      <ToolForm tool={tool} />
    </main>
  );
}