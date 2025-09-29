import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- クライアントの初期化 ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- ヘルパー関数 ---
function buildPrompt(basePrompt: string, inputData: Record<string, string>, outputCount: number): string {
  let prompt = basePrompt;
  // inputDataのプレースホルダーを置換
  for (const key in inputData) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), inputData[key]);
  }
  // outputCountのプレースホルダーを置換
  prompt = prompt.replace(/{outputCount}/g, String(outputCount));
  return prompt;
}

function parseGeneratedText(text: string): string[] {
  // 箇条書き（1., 2., ...）で分割し、余分な空白や数字を削除
  return text
    .split(/\n\s*\d+\.\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// --- メインのAPI処理 ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolId, inputData, modelProvider = 'openai', outputCount = 1 } = body;

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
    const finalPrompt = buildPrompt(tool.basePrompt, inputData, outputCount);

    let rawGeneratedText: string | null = null;
    let modelUsed: string = '';

    // --- 4. AIにリクエスト ---
    if (modelProvider === 'gemini') {
      modelUsed = 'gemini-2.5-flash';
      const model = genAI.getGenerativeModel({ model: modelUsed });
      const result = await model.generateContent(finalPrompt);
      rawGeneratedText = result.response.text();
    } else {
      modelUsed = 'gpt-4o';
      const completion = await openai.chat.completions.create({
        model: modelUsed,
        messages: [{ role: 'user', content: finalPrompt }],
      });
      rawGeneratedText = completion.choices[0]?.message?.content;
    }

    if (!rawGeneratedText) {
      return NextResponse.json({ error: 'AIからのテキスト生成に失敗しました。' }, { status: 500 });
    }

    // --- 5. 履歴をDBに保存 (パース前の生テキストを保存) ---
    await prisma.history.create({
      data: {
        toolId: tool.id,
        inputData: { ...inputData, outputCount },
        outputText: rawGeneratedText,
        modelUsed: modelUsed,
      },
    });

    // --- 6. 結果をパースしてフロントエンドに返す ---
    const outputTexts = tool.outputCountEnabled ? parseGeneratedText(rawGeneratedText) : [rawGeneratedText];

    return NextResponse.json({
      outputs: outputTexts, // 配列で返す
      modelUsed: modelUsed,
    });

  } catch (error) {
    console.error('[/api/generate] Error:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}