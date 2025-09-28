-- このSQLをSupabaseのSQL Editorで実行すると、初期データ（3つのツール）が投入されます。

INSERT INTO "Tool" ("title", "description", "input_schema", "base_prompt", "updated_at") VALUES
(
  'ブログ記事生成ツール',
  'キーワードを入れるだけでブログ記事のドラフトを生成します。',
  '{
    "type": "object",
    "properties": {
      "keyword": { "type": "string", "description": "キーワード" },
      "tone": {
        "type": "select",
        "description": "トーン",
        "enum": ["敬語", "カジュアル", "フレンドリー", "中二病"]
      }
    },
    "required": ["keyword"]
  }',
  'キーワード「{keyword}」について、{tone}なトーンでブログ記事を書いてください。',
  NOW()
),
(
  'SNS投稿文生成ツール',
  '商品の特徴から魅力的なSNS投稿文を複数パターン生成します。',
  '{
    "type": "object",
    "properties": {
      "productName": { "type": "string", "description": "商品名" },
      "features": { "type": "textarea", "description": "商品の特徴" }
    },
    "required": ["productName", "features"]
  }',
  '商品名「{productName}」、特徴「{features}」を持つ商品のSNS投稿文を3パターン考えてください。',
  NOW()
),
(
  'キャッチコピー生成ツール',
  'サービス名や特徴からキャッチコピーを複数案生成します。',
  '{
    "type": "object",
    "properties": {
      "serviceName": { "type": "string", "description": "サービス名" },
      "features": { "type": "string", "description": "サービスの特徴" },
      "target": { "type": "string", "description": "ターゲット層" }
    },
    "required": ["serviceName", "features", "target"]
  }',
  'サービス名「{serviceName}」、特徴「{features}」、ターゲット層「{target}」向けのキャッチコピーを5つ提案してください。',
  NOW()
);
