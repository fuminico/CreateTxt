import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Sparkles } from "lucide-react";
import { M_PLUS_Rounded_1c } from 'next/font/google';

// Next.js/fontでフォントを読み込む
const customFont = M_PLUS_Rounded_1c({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-custom', // CSS変数として定義
});

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
      <body className={`${customFont.variable} font-sans antialiased`}>
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
