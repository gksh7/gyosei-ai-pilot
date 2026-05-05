import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "行政書士AI Pilot｜2026法改正コンプライアンスナビ",
  description:
    "2026年改正行政書士法（無資格代行の厳罰化）に対応するためのAI法務メディア。コンサル・人材・通信教育企業の「知らずに違反」を防ぐ最新情報を毎日配信。無料コンプライアンス診断も提供。",
  openGraph: {
    title: "行政書士AI Pilot｜2026法改正コンプライアンスナビ",
    description:
      "2026年改正行政書士法への対応をAIがサポート。官公庁の最新情報を毎日収集・解説し、無料コンプライアンス診断も提供します。",
    type: "website",
  },
};

export const revalidate = 3600;

const PER_PAGE = 10;

async function getArticles(page: number): Promise<{ articles: Article[]; total: number }> {
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return { articles: [], total: 0 };
  return { articles: data ?? [], total: count ?? 0 };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { articles, total } = await getArticles(page);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* コンプライアンス診断バナー（フルワイド） */}
      <div className="relative overflow-hidden text-white" style={{ maxWidth: "2020px", margin: "0 auto" }}>
        {/* SP: 画像を背景に */}
        <div className="absolute inset-0 sm:hidden">
          <img src="/mv_sp.png" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(37,99,235,0.88), rgba(36,69,155,0.72))" }} />
        </div>

        {/* PC: 左グラデーション + 右に画像 */}
        <div className="absolute inset-0 hidden sm:flex">
          <div className="w-3/5 h-full" style={{ background: "linear-gradient(to right, #2563eb, #24459b)" }} />
          <div className="w-2/5 h-full relative">
            <img src="/mv_pc.png" alt="" className="w-full h-full object-cover object-left" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #24459b, transparent)" }} />
          </div>
        </div>

        {/* テキスト・ボタン */}
        <div className="relative px-6 py-10 sm:py-16 sm:px-16 sm:max-w-[55%]">
          <p className="text-blue-100 text-xs font-medium mb-1">無料・即時診断</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            あなたの会社は大丈夫？
          </h2>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            2026年改正行政書士法への対応状況をAIが診断。
            コンサル・人材・通信教育企業の法務リスクを今すぐチェック。
          </p>
          <Link
            href="/diagnosis"
            className="diagnosis-btn inline-block bg-white text-base px-7 py-3 rounded-full transition-all duration-200 hover:scale-105"
            style={{ color: "#2563eb", fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
          >
            コンプライアンス診断を始める →
          </Link>
        </div>
      </div>

      {/* 記事一覧（コンテナ内） */}
      <div className="max-w-4xl mx-auto px-4 py-8">
      <div>
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">
            2026年改正行政書士法｜最新コンプライアンス情報
          </h1>
          <h2 className="text-base font-semibold text-gray-700 mb-1">最新記事</h2>
          <p className="text-gray-600 text-sm">
            AIが官公庁・法律ニュースを毎日収集・解説します
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">記事を準備中です</p>
            <p className="text-gray-400 text-sm">毎朝自動的に記事が追加されます</p>
          </div>
        ) : (
          <>
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
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(article.created_at)}
                  </p>
                </Link>
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/?page=${page - 1}`}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    ← 前へ
                  </Link>
                )}
                <span className="text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/?page=${page + 1}`}
                    className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    次へ →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
