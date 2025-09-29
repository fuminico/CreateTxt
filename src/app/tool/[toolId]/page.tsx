import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ToolForm } from './components/ToolForm';

// サーバーコンポーネントとして非同期にデータを取得
export default async function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  // params自体がPromiseなので、awaitで解決してからプロパティにアクセスする
  const { toolId: toolIdString } = await params;
  const toolId = parseInt(toolIdString, 10);

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