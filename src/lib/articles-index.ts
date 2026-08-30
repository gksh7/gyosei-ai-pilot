import { supabase } from "./supabase";

/**
 * チャットボット用の軽量記事インデックス。
 * 公開記事のタイトル・要約・タグ・スラッグを1行1記事のMarkdownリストにして返す。
 * Claude のシステムプロンプトに丸ごと差し込み、関連記事の選定とリンク提示に使う。
 * インスタンスメモリに1時間キャッシュ（記事は日次で1本増える程度なので十分）。
 */

const TTL_MS = 60 * 60 * 1000;

let cache: { text: string; count: number; at: number } | null = null;

export type ArticlesIndex = { text: string; count: number };

export async function getArticlesIndex(): Promise<ArticlesIndex> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return { text: cache.text, count: cache.count };
  }

  const { data, error } = await supabase
    .from("articles")
    .select("slug, title, summary, tags")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (cache) return { text: cache.text, count: cache.count };
    return { text: "", count: 0 };
  }

  const lines = data.map((a) => {
    const tags = (a.tags ?? []).join("・");
    const summary = (a.summary ?? "").replace(/\s+/g, " ").trim();
    const tagPart = tags ? ` 〈${tags}〉` : "";
    const sumPart = summary ? `: ${summary}` : "";
    return `- [${a.title}](/articles/${a.slug})${tagPart}${sumPart}`;
  });

  cache = { text: lines.join("\n"), count: data.length, at: Date.now() };
  return { text: cache.text, count: cache.count };
}
