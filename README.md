# AIテキスト生成ツール

AI（OpenAI/Gemini）を活用して、様々な用途に合わせたテキストを生成するアプリケーションです。

## ✨ 主な機能

- **マルチAIモデル対応**: OpenAI (GPT-3.5) と Google (Gemini 1.5) を切り替えてテキストを生成できます。
- **動的フォーム生成**: データベースに定義されたスキーマ（`inputSchema`）に基づき、ツールごとに最適な入力フォームを自動で構築します。
- **入力タイプのサポート**: 一行入力（Input）、複数行入力（Textarea）、選択式（ToggleGroup）など、柔軟な入力形式に対応しています。
- **生成履歴の保存**: 生成されたテキストはすべてデータベースに記録され、後から一覧で確認できます。
- **ポップなUIデザイン**: パステルカラーを基調とした、親しみやすく可愛らしいデザインを採用しています。

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**:
  - スタイリング: Tailwind CSS
  - コンポーネント: shadcn/ui
  - アニメーション: Framer Motion
- **データベース**:
  - ORM: Prisma
  - 開発用DB: SQLite
- **外部API**:
  - OpenAI API
  - Google Gemini API

## 🚀 環境構築と起動方法

### 1. 前提条件

- [Node.js](https://nodejs.org/) (v18.17.0 以上を推奨)
- [npm](https://www.npmjs.com/) (Node.jsに同梱)

### 2. リポジトリのクローンと移動

```bash
git clone https://github.com/fuminico/CreateTxt.git
cd CreateTxt/app
```

### 3. 依存パッケージのインストール

```bash
npm install
```

### 4. 環境変数の設定

プロジェクトルートにある `.env.example` ファイルをコピーして、`.env` という名前のファイルを作成します。

```bash
# Windowsの場合
copy .env.example .env

# macOS / Linuxの場合
# cp .env.example .env
```

作成した `.env` ファイルを開き、ご自身のAPIキーを設定してください。

```env
# ... (DATABASE_URLは変更不要)

# OpenAI API Key
OPENAI_API_KEY="ここにあなたのOpenAI APIキーを貼り付け"

# Gemini API Key
GEMINI_API_KEY="ここにあなたのGemini APIキーを貼り付け"
```

### 5. データベースのセットアップ

以下のコマンドを実行して、データベース（SQLite）のマイグレーションと初期データの投入を行います。

```bash
# データベースのテーブルを作成
npx prisma migrate dev

# 初期データ（ツール定義など）を投入
npx prisma db seed
```

### 6. 開発サーバーの起動

すべての準備が整いました。以下のコマンドで開発サーバーを起動します。

```bash
npm run dev
```

起動後、ブラウザで [http://localhost:3004](http://localhost:3004) にアクセスすると、アプリケーションが表示されます。

## 📖 便利なコマンド

- **`npm run dev`**: 開発サーバーを起動します。
- **`npm run build`**: プロダクション用にビルドします。
- **`npm run start`**: プロダクションサーバーを起動します。
- **`npx prisma studio`**: データベースの内容をGUIで確認・編集できるPrisma Studioを起動します。

---
この手順書により、別の開発者も同じ環境を構築し、開発を始めることができます。