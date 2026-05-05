import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import Link from "next/link";

export const revalidate = 3600;

async function getArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return data ?? [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <div className="space-y-10">
      {/* コンプライアンス診断バナー */}
      <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(to right, #2563eb, #24459b)" }}>
        <p className="text-blue-100 text-xs font-medium mb-1">無料・即時診断</p>
        <h2 className="text-xl font-bold mb-2">
          あなたの会社は大丈夫？
        </h2>
        <p className="text-blue-100 text-sm mb-4 leading-relaxed">
          2026年改正行政書士法への対応状況をAIが診断。
          コンサル・人材・通信教育企業の法務リスクを今すぐチェック。
        </p>
        <Link
          href="/diagnosis"
          className="inline-block bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors"
        >
          コンプライアンス診断を始める →
        </Link>
      </div>

      {/* 記事一覧 */}
      <div>
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1">最新記事</h1>
          <p className="text-gray-500 text-sm">
            AIが官公庁・法律ニュースを毎日収集・解説します
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">記事を準備中です</p>
            <p className="text-gray-400 text-sm">毎朝自動的に記事が追加されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex gap-2 mb-2 flex-wrap">
                  {article.tags?.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1.5 leading-snug">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(article.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
