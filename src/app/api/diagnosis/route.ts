import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { GYOSEI_LAW_CONTEXT } from "@/lib/gyosei-law";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { answers } = await req.json();

  const prompt = `あなたは行政書士法に詳しいコンプライアンス・アドバイザーです。
以下の法令コンテキストを踏まえ、企業の回答を診断してください。

${GYOSEI_LAW_CONTEXT}

【企業の回答】
1. 業種: ${answers[0]}
2. 行政手続きサービスの提供: ${answers[1]}
3. 反復継続性（業として該当判定）: ${answers[2]}
4. 料金名目（脱法スキーム判定）: ${answers[3]}
5. 社内の行政書士資格保持者: ${answers[4]}
6. 外部行政書士との業務提携: ${answers[5]}
7. 改正法の把握状況: ${answers[6]}

【診断観点】
- 第19条「業として」の該当性（Q2 × Q3で判定）
- 「いかなる名目によるかを問わず報酬を得て」への該当（Q4で判定）
- 両罰規定（法人罰）への対応リスク（Q4・Q5・Q6を総合）
- セーフハーバー充足度（Q5・Q6で判定）
- 改正対応の準備度（Q7で判定）

以下のJSON形式のみで出力してください（前後に文章不要）:
{
  "riskLevel": "高" | "中" | "低",
  "riskLabel": "要緊急対応" | "要注意" | "問題なし",
  "summary": "診断結果の一言まとめ（40字以内）",
  "issues": ["リスク・問題点を箇条書きで2〜4点。条文番号（第19条等）に言及"],
  "actions": ["推奨アクションを箇条書きで2〜4点。具体的に"],
  "message": "企業へのメッセージ（120字以内・具体的に）"
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
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
