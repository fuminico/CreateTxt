import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // 既存のデータを削除
  await prisma.tool.deleteMany();
  console.log('Deleted existing tools.');

  const tools = [
    {
      title: 'ブログ記事生成ツール',
      description: 'キーワードを入れるだけでブログ記事のドラフトを生成します。',
      category: 'ブログ',
      inputSchema: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: 'キーワード' },
          tone: { 
            type: 'select', 
            description: 'トーン',
            enum: ['敬語', 'カジュアル', 'フレンドリー', '中二病']
          },
        },
        required: ['keyword'],
      },
      basePrompt: 'キーワード「{keyword}」について、{tone}なトーンでブログ記事を書いてください。',
    },
    {
      title: 'SNS投稿文生成ツール',
      description: '商品の特徴から魅力的なSNS投稿文を複数パターン生成します。',
      category: 'SNS',
      inputSchema: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: '商品名' },
          features: { type: 'textarea', description: '商品の特徴' },
        },
        required: ['productName', 'features'],
      },
      basePrompt: '商品名「{productName}」、特徴「{features}」を持つ商品のSNS投稿文を3パターン考えてください。',
    },
    {
        title: 'キャッチコピー生成ツール',
        description: 'サービス名や特徴からキャッチコピーを複数案生成します。',
        category: 'マーケティング',
        inputSchema: {
          type: 'object',
          properties: {
            serviceName: { type: 'string', description: 'サービス名' },
            features: { type: 'string', description: 'サービスの特徴' },
            target: { type: 'string', description: 'ターゲット層' },
          },
          required: ['serviceName', 'features', 'target'],
        },
        basePrompt: 'サービス名「{serviceName}」、特徴「{features}」、ターゲット層「{target}」向けのキャッチコピーを5つ提案してください。',
      },
  ];

  for (const tool of tools) {
    const createdTool = await prisma.tool.create({
      data: tool,
    });
    console.log(`Created tool with id: ${createdTool.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });