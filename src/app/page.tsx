"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface Tool {
  id: number;
  title: string;
  description: string;
}

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('ツールの読み込みに失敗しました。');
        const data = await response.json();
        setTools(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-pink-400 to-orange-300"
        >
          AIテキスト生成ツール
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground mt-4 max-w-2xl mx-auto"
        >
          好きなツールを選んで、AIでいろんなテキストを作ってみよう！
        </motion.p>
      </header>

      {loading && <div className="flex justify-center items-center"><Loader2 className="size-10 animate-spin text-pink-400" /></div>}
      {error && <div className="text-destructive text-center">{error}</div>}

      {!loading && !error && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="flex flex-col h-full bg-white shadow-lg rounded-2xl border-t-4 border-pink-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">{tool.title}</CardTitle>
                  <CardDescription className="text-slate-500">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <Link href={`/tool/${tool.id}`} className="w-full">
                    <Button className="w-full bg-pink-400 text-white hover:bg-pink-500 rounded-full font-bold">ツールを使う</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}