import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "AIテキスト生成ツール",
  description: "AIを使っていろんなテキストを生成するアプリケーションです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* Google Fontsの読み込みをheadに移動 */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
            <Link href="/" className="flex items-center font-bold">
              <Sparkles className="mr-2 size-5 text-pink-400" />
              AIテキスト生成ツール
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
                ホーム
              </Link>
              <Link href="/history" className="text-muted-foreground transition-colors hover:text-foreground">
                生成履歴
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}