import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { GYOSEI_LAW_CONTEXT } from "@/lib/gyosei-law";
import { getArticlesIndex } from "@/lib/articles-index";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clientIp, ipHash } from "@/lib/ip";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// コスト重視のため Haiku を使用。品質を上げたい場合は claude-sonnet-5 等に変更。
const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1500;

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 12; // user+assistant 合わせて

// --- 簡易レート制限（インスタンスメモリ・ベストエフォート） ---
const RL_WINDOW_MS = 60_000;
const RL_MAX_PER_IP = 8; // 1分あたり8メッセージ/IP
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear(); // メモリ暴走の保険
  return hits.length > RL_MAX_PER_IP;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(indexText: string, count: number): string {
  return `あなたは「行政書士AI Pilot」（gyosei-ai-pilot.com）のサイト内アシスタントです。
2026年施行の改正行政書士法、無資格代行、許認可申請のコンプライアンスに関する
来訪者の質問に、日本語で答えます。

## 回答のルール
- まず下記「サイトの記事一覧」から関連記事を探し、その内容に基づいて回答する。
- 関連記事があれば、回答内で必ず Markdown リンク [記事タイトル](/articles/スラッグ) の形式で1〜3本示す。一覧に載っているスラッグ以外のURLを作らない。
- 記事で扱っていない一般的な行政書士法の知識で補ってよいが、その場合は「一般的な情報ですが」と前置きする。
- サイトのテーマ（行政書士法・許認可・コンプライアンス）と無関係な質問には、
  「このサイトは行政書士法・許認可のコンプライアンスに関する情報サイトです。その話題は扱っていません」と丁寧に断り、深追いしない。
- チャットUIでの回答なので短くする。全体で最大5文、または箇条書き最大5項目まで。
- 見出し（#）・表・水平線（---）は使わない。プレーンな文と「- 」の箇条書き、**強調**、リンクのみ。
- 関連記事リンクは本文中か、末尾に「関連記事：」として最大2本。
- 個別の法律相談や「確実に合法/違法」という断定はしない。判断が微妙なケースは
  「具体的なケースは行政書士などの専門家にご相談ください」と促す。
- 定型の免責文を毎回繰り返さない（UIに表示済み）。

## 法令コンテキスト
${GYOSEI_LAW_CONTEXT}

## サイトの記事一覧（${count}本）
${indexText}`;
}

/** 質問・回答を Supabase に記録（失敗してもチャットは止めない）。 */
async function logChat(params: {
  question: string;
  answer: string;
  turnCount: number;
  ipHash: string;
}): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from("chat_logs").insert({
      question: params.question.slice(0, 2000),
      answer: params.answer.slice(0, 8000),
      turn_count: params.turnCount,
      ip_hash: params.ipHash,
    });
    if (error) console.error("[chat] log insert failed:", error.message);
  } catch (err) {
    console.error("[chat] log error:", err);
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "設定エラー" }, { status: 500 });
  }

  const ip = clientIp(req.headers);
  if (rateLimited(ip)) {
    return Response.json(
      { error: "アクセスが集中しています。しばらく待ってからお試しください。" },
      { status: 429 },
    );
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  const raw = body.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return Response.json({ error: "メッセージがありません" }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_TURNS)) {
    if (
      !m ||
      typeof m !== "object" ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string"
    ) {
      return Response.json({ error: "メッセージ形式が不正です" }, { status: 400 });
    }
    messages.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) });
  }

  if (messages[messages.length - 1]?.role !== "user") {
    return Response.json({ error: "最後のメッセージはユーザー発言である必要があります" }, { status: 400 });
  }

  const { text: indexText, count } = await getArticlesIndex();
  const systemPrompt = buildSystemPrompt(indexText, count);

  const question = messages[messages.length - 1].content;
  const hashedIp = ipHash(ip);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [
            { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
          ],
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            answer += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        controller.enqueue(
          encoder.encode("\n\n（回答の生成中にエラーが発生しました。時間をおいて再度お試しください）"),
        );
      } finally {
        controller.close();
        void logChat({
          question,
          answer,
          turnCount: messages.length,
          ipHash: hashedIp,
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
