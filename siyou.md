# 詳細設計書（AIテキスト生成ツール）

## 1. 使用技術スタックの提案

### フロントエンド
- **Next.js (App Router) + TypeScript**  
  ReactベースでSSR/ISR対応、SEOとパフォーマンスに強い。
- **Tailwind CSS + shadcn/ui + Radix UI**  
  モダンUIを短期間で実装可能。Radixはアクセシビリティ面も強い。
- **Framer Motion**  
  結果表示や遷移のアニメーションに利用。UX向上。

### バックエンド（API層）
- **Next.js API Routes** または **Edge Functions (Supabase)**  
  小規模MVPではNext.jsのAPI Routeで十分。将来的にSupabase Edge Functionsへ移行可能。
- **認証不要（匿名利用前提）**  
  APIキーの秘匿は必須。サーバー側でのみ管理。

### データベース
- **Supabase (PostgreSQLベース)**  
  ホスティング、API、Auth、RLSなど一式揃っておりスケールしやすい。
- **開発段階ではSQLite**  
  ローカル確認用。デプロイ時にSupabaseへ移行。

### 外部API
- **OpenAI GPT-4/3.5**
- **Google Gemini**
- **Meta Llama (Ollama / API経由)**  
  複数LLMを切替可能にして将来拡張性を確保。

---

## 2. データベース設計（ER図）

```mermaid
erDiagram
    tools {
        int id PK
        text title
        text description
        json input_schema
        text base_prompt
        timestamp created_at
        timestamp updated_at
    }

    histories {
        int id PK
        int tool_id FK
        json input_data
        text output_text
        text model_used
        timestamp created_at
    }

    tools ||--o{ histories : "1対多"
````

* **関係性**
  1つのツール（tools）に対して、複数の生成履歴（histories）が紐づく **1対多**。
* **設計ポイント**

  * `input_schema` によりツールごとに自由に入力項目を定義可能。
  * 履歴は匿名利用でも保存し、将来的な分析や改善に利用。

---

## 3. API設計

### ツール管理API

1. **GET /api/tools**
   ツール一覧取得
2. **GET /api/tools/:id**
   特定ツール取得
3. **POST /api/tools**（管理用）
   新規ツール登録

### 生成リクエストAPI

1. **POST /api/generate**
   入力値を受け取り、指定LLMに投げて結果を返す。

   * レスポンスに `output_text` と `model_used` を含む。

---

## 4. 非機能要件

### 速さ（パフォーマンス）

* Next.js の SSR/ISR による高速表示
* APIリクエストは非同期で実行し、結果待ち中はローディングアニメーション

### 丈夫さ（信頼性・拡張性）

* DBスキーマをシンプルに保ち、将来の拡張に対応
* LLMエラー時はユーザーにリトライを促すメッセージ表示

### セキュリティ

* ユーザー登録不要のため個人情報は保持しない
* APIキーはサーバー側でのみ保持
* IP単位でリクエスト数制限を導入

---

## 5. ポート番号設計（ローカル環境）

### デフォルト衝突回避

* `3000` および `3001` は既に利用中のため、**3002以降**を使用する。

### Next.js 側

* **開発時コマンド**

  ```bash
  npm run dev -- -p 3002
  ```
* **package.json 修正例**

  ```json
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002"
  }
  ```

### Supabase Studio 側（ローカルDocker利用時）

* `docker-compose.yml`

  ```yaml
  services:
    studio:
      ports:
        - "3003:3000"   # ローカル3003 → コンテナ3000
  ```
* `.env`

  ```env
  STUDIO_PORT=3003
  ```

### 利用ポート例

* Next.js (フロント&API) → **[http://localhost:3002](http://localhost:3002)**
* Supabase Studio → **[http://localhost:3003](http://localhost:3003)**
* PostgreSQL (DB) → **5432**（変更不要）

---

```

---
