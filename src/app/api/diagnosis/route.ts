import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { answers } = await req.json();

  const prompt = `以下はある企業のコンプライアンス診断の回答です。2026年改正行政書士法（無資格代行の厳罰化）の観点から診断してください。

【回答内容】
1. 業種: ${answers[0]}
2. 行政手続きのサービス提供: ${answers[1]}
3. 社内の行政書士資格保持者: ${answers[2]}
4. 外部行政書士との業務提携: ${answers[3]}
5. 改正法の把握状況: ${answers[4]}

以下のJSON形式のみで出力してください（前後に文章不要）:
{
  "riskLevel": "高" | "中" | "低",
  "riskLabel": "要緊急対応" | "要注意" | "問題なし",
  "summary": "診断結果の一言まとめ（40字以内）",
  "issues": ["リスク・問題点を箇条書きで2〜4点"],
  "actions": ["推奨アクションを箇条書きで2〜4点"],
  "message": "企業へのメッセージ（100字以内・具体的に）"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "診断に失敗しました" }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}
