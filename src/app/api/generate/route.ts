import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- クライアントの初期化 ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


// --- ヘルパー関数 ---
function buildPrompt(basePrompt: string, inputData: Record<string, string>): string {
  let prompt = basePrompt;
  for (const key in inputData) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), inputData[key]);
  }
  return prompt;
}

// --- メインのAPI処理 ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolId, inputData, modelProvider = 'openai' } = body; // デフォルトはopenai

    // --- 1. バリデーション ---
    if (!toolId || typeof toolId !== 'number' || !inputData || typeof inputData !== 'object') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // --- 2. ツール情報をDBから取得 ---
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // --- 3. プロンプト構築 ---
    const finalPrompt = buildPrompt(tool.basePrompt, inputData);

    let generatedText: string | null = null;
    let modelUsed: string = '';

    // --- 4. modelProviderに応じてAIにリクエスト ---
    if (modelProvider === 'gemini') {
      // Geminiの場合
      modelUsed = 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelUsed });
      const result = await model.generateContent(finalPrompt);
      const response = result.response;
      generatedText = response.text();

    } else {
      // OpenAI (デフォルト) の場合
      modelUsed = 'gpt-3.5-turbo';
      const completion = await openai.chat.completions.create({
        model: modelUsed,
        messages: [{ role: 'user', content: finalPrompt }],
      });
      generatedText = completion.choices[0]?.message?.content;
    }

    if (!generatedText) {
      return NextResponse.json({ error: 'AIからのテキスト生成に失敗しました。' }, { status: 500 });
    }

    // --- 5. 履歴をDBに保存 ---
    await prisma.history.create({
      data: {
        toolId: tool.id,
        inputData: inputData,
        outputText: generatedText,
        modelUsed: modelUsed,
      },
    });

    // --- 6. 結果をフロントエンドに返す ---
    return NextResponse.json({
      outputText: generatedText,
      modelUsed: modelUsed,
    });

  } catch (error) {
    console.error('[/api/generate] Error:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    // TODO: Geminiのエラーハンドリングをより詳細に
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
