"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { Loader2, MessageSquare, Clock } from 'lucide-react';
import { Tool } from '@prisma/client';

// 履歴データの型定義 (Toolの情報を含む)
interface HistoryEntry {
  id: number;
  toolId: number;
  inputData: any;
  outputText: string;
  modelUsed: string;
  createdAt: string;
  tool: {
    title: string;
  };
}

export default function HistoryPage() {
  const [histories, setHistories] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const response = await fetch('/api/histories');
        if (!response.ok) throw new Error('履歴の読み込みに失敗しました。');
        const data = await response.json();
        setHistories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchHistories();
  }, []);

  // inputDataを読みやすい形式に変換するヘルパー関数
  const formatInputData = (data: any) => {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-sky-400 to-blue-500"
        >
          生成履歴
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground mt-4 max-w-2xl mx-auto"
        >
          これまでにAIが生成したテキストの一覧です。
        </motion.p>
      </header>

      {loading && <div className="flex justify-center items-center"><Loader2 className="size-10 animate-spin text-sky-400" /></div>}
      {error && <div className="text-destructive text-center">{error}</div>}

      {!loading && !error && (
        <div className="space-y-6">
          {histories.length === 0 ? (
            <p className="text-center text-slate-500">まだ履歴がありません。</p>
          ) : (
            histories.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="bg-white shadow-md rounded-xl overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-slate-700">{entry.tool.title}</CardTitle>
                      <div className="flex items-center text-xs text-slate-400">
                        <Clock className="mr-1 size-3" />
                        {new Date(entry.createdAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <CardDescription className="!mt-2 text-xs text-slate-500 border-l-2 border-sky-200 pl-2">
                      入力: {formatInputData(entry.inputData)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="size-5 mt-1 text-sky-400 flex-shrink-0" />
                      <p className="text-slate-600 whitespace-pre-wrap">{entry.outputText}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
