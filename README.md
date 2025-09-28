# AIテキスト生成ツール

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffuminico%2FCreateTxt)

AI（OpenAI/Gemini）を活用して、様々な用途に合わせたテキストを生成するアプリケーションです。

## ✨ 主な機能

- **最新AIモデル対応**: OpenAI (`gpt-4o`) と Google (`gemini-2.5-flash`) の最新モデルを切り替えてテキストを生成できます。
- **動的フォーム生成**: データベースに定義されたスキーマに基づき、ツールごとに最適な入力フォーム（一行入力, 複数行入力, 選択ボタン）を自動で構築します。
- **生成履歴**: 生成されたテキストはすべてSupabaseのデータベースに記録され、後から一覧で確認できます。
- **ポップなUIデザイン**: パステルカラーを基調とした、親しみやすく可愛らしいデザインをFramer Motionのアニメーションと共に実現しています。

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **ORM**: Prisma
- **データベース**: PostgreSQL (Supabase)
- **外部API**: OpenAI API, Google Gemini API
- **デプロイ**: Vercel

## 🚀 ローカル環境での起動方法

### 1. 前提条件

- [Node.js](https://nodejs.org/) (v18.17.0 以上)
- [npm](https://www.npmjs.com/)
- [Supabase](https://supabase.com/) アカウント

### 2. セットアップ

1.  **リポジトリをクローンし、ディレクトリを移動します。**
    ```bash
    git clone https://github.com/fuminico/CreateTxt.git
    cd CreateTxt/app
    ```

2.  **依存パッケージをインストールします。**
    ```bash
    npm install
    ```

3.  **Supabaseプロジェクトの準備**
    -   Supabaseで新しいプロジェクトを作成します。
    -   プロジェクトの `Settings` > `Database` に移動し、**Connection Pooling**用の接続文字列（URI）をコピーします。

4.  **環境変数の設定**
    -   `.env.example` をコピーして `.env` ファイルを作成します。
    -   `.env` ファイルを開き、取得した情報を設定します。
      ```.env
      # Supabaseの接続URL（Connection Pooler）の末尾に `?pgbouncer=true` を追加してください
      DATABASE_URL="postgresql://postgres.[YOUR-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

      # 各種APIキー
      OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
      GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
      ```

5.  **データベースのテーブル作成とデータ投入**
    -   Supabaseプロジェクトの **SQL Editor** を開きます。
    -   `prisma/migrations` 内にある `migration.sql` ファイルの内容をコピー＆ペーストして実行し、テーブルを作成します。
    -   `prisma/seed.sql` (手動で作成) の内容を実行し、初期データを投入します。（`prisma db seed`は現在Supabaseのコネクションプーラーと互換性の問題があるため、手動での投入を推奨します）

6.  **開発サーバーの起動**
    ```bash
    npm run dev
    ```
    ブラウザで [http://localhost:3004](http://localhost:3004) を開くと、アプリケーションが表示されます。

## 🌐 Vercelへのデプロイ

1.  **リポジトリをGitHubにプッシュします。**

2.  **Vercelでプロジェクトをインポートします。**
    -   Vercelにログインし、「Add New...」>「Project」から、このGitHubリポジトリを選択します。

3.  **環境変数を設定します。**
    -   Vercelのプロジェクト設定画面で、`.env`ファイルと同じ内容の環境変数をすべて設定します。
    -   **重要**: `DATABASE_URL`は、接続文字列の末尾に `?sslmode=require` を追加することをVercelは推奨しています。
      ```
      postgresql://postgres.[REF]:[PASS]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
      ```

4.  **「Deploy」ボタンをクリックします。**
    -   ビルドとデプロイが自動的に開始され、完了すると公開URLが発行されます。
---
この手順書により、別の開発者も同じ環境を構築し、開発を始めることができます。
