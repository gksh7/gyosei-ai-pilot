import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { clientIp, ipHash } from "@/lib/ip";

/**
 * 「行政書士に相談したい」ボタンの需要計測エンドポイント。
 * 個人情報は受け取らない。source（どこで押されたか）と context（リスクレベル/質問/スラッグ）だけ記録する。
 */

const ALLOWED_SOURCES = new Set(["diagnosis", "chat", "article"]);

// 簡易レート制限（インスタンスメモリ）
const RL_WINDOW_MS = 60_000;
const RL_MAX = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > RL_MAX;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (rateLimited(ip)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  let body: { source?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const source = typeof body.source === "string" ? body.source : "";
  if (!ALLOWED_SOURCES.has(source)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const context =
    typeof body.context === "string" ? body.context.slice(0, 500) : null;

  if (!supabaseAdmin) {
    // テーブル/キー未設定でもボタン自体は成立させる
    return Response.json({ ok: true });
  }

  try {
    const { error } = await supabaseAdmin
      .from("consult_interest")
      .insert({ source, context, ip_hash: ipHash(ip) });
    if (error) console.error("[interest] insert failed:", error.message);
  } catch (err) {
    console.error("[interest] error:", err);
  }

  return Response.json({ ok: true });
}
