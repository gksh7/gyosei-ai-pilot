import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";

const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "行政書士AI Pilot｜2026法改正コンプライアンスナビ",
  description:
    "2026年改正行政書士法（無資格代行の厳罰化）に対応するためのAI法務メディア。コンサル・人材・通信教育企業の「知らずに違反」を防ぐ最新情報を毎日配信。無料コンプライアンス診断も提供。",
  openGraph: {
    title: "行政書士AI Pilot｜2026法改正コンプライアンスナビ",
    description:
      "2026年改正行政書士法への対応をAIがサポート。官公庁の最新情報を毎日収集・解説し、無料コンプライアンス診断も提供します。",
    type: "website",
    url: SITE_URL,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "行政書士AI Pilot｜2026法改正コンプライアンスナビ",
    description:
      "2026年改正行政書士法への対応をAIがサポート。官公庁の最新情報を毎日収集・解説し、無料コンプライアンス診断も提供します。",
    images: [OGP_IMAGE],
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

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "行政書士AI Pilot｜2026法改正ナビ",
    url: SITE_URL,
    description:
      "2026年改正行政書士法（無資格代行の厳罰化）に対応するためのAI法務メディア。コンサル・人材・通信教育企業の法務リスクを毎日配信。",
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "最新記事",
    url: SITE_URL,
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PER_PAGE + i + 1,
      name: article.title,
      url: `${SITE_URL}/articles/${article.slug}`,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      {/* コンプライアンス診断バナー（フルワイド） */}
      <div
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: "#0c2461", minHeight: "375px" }}
      >
        {/* 背景画像（中央揃え・最大1010px） */}
        <div
          className="absolute top-0 bottom-0 hidden sm:block"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(100%, 1010px)",
          }}
        >
          <img src="/mv_pc.png" alt="" className="w-full h-full object-cover object-center" />
          {/* 1010px超の両端をフェード */}
          <div className="absolute inset-y-0 left-0 w-24" style={{ background: "linear-gradient(to right, #0c2461, transparent)" }} />
          <div className="absolute inset-y-0 right-0 w-24" style={{ background: "linear-gradient(to left, #0c2461, transparent)" }} />
        </div>

        {/* SP背景画像 */}
        <div className="absolute inset-0 sm:hidden">
          <img src="/mv_sp.png" alt="" className="w-full h-full object-cover object-center" />
        </div>

        {/* テキスト読みやすくする左グラデーション */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(12,36,97,0.92) 0%, rgba(12,36,97,0.7) 40%, rgba(12,36,97,0.15) 65%, transparent 100%)" }}
        />

        {/* テキスト・ボタン（1010px中央揃えコンテナの左50%） */}
        <div className="relative mx-auto" style={{ maxWidth: "1010px", minHeight: "375px" }}>
          <div className="mv-text flex flex-col justify-center sm:block px-6 sm:py-14 [@media(min-width:1042px)]:px-0 [@media(min-width:851px)]:max-w-[50%] [@media(min-width:768px)_and_(max-width:850px)]:max-w-[60%]" style={{ minHeight: "375px" }}>
            <p className="text-blue-200 text-[15px] sm:text-lg font-medium mb-1">無料・即時診断</p>
            <h2 className="text-[28px] sm:text-[34px] font-bold mb-3 sm:leading-tight">
              あなたの会社は大丈夫？
            </h2>
            <p className="text-blue-100 text-[14px] sm:text-[16px] mb-6 leading-relaxed">
              2026年改正行政書士法への対応状況をAIが診断。<br className="hidden sm:block" />
              コンサル・人材・通信教育企業の法務リスクを今すぐチェック。
            </p>
            <div className="flex justify-center sm:block">
              <Link
                href="/diagnosis"
                className="diagnosis-btn inline-block text-base sm:text-xl font-bold px-6 sm:px-9 py-3 sm:py-3.5 rounded-full transition-all duration-200 hover:scale-105"
                style={{ fontFamily: "var(--font-noto-sans-jp), sans-serif" }}
              >
                コンプライアンス診断を始める →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 記事一覧（コンテナ内） */}
      <div className="max-w-[1010px] mx-auto px-6 min-[1042px]:px-0 py-8">
      <div>
        <div className="mb-5">
          <h1 className="text-xl [@media(min-width:1024px)]:text-2xl font-bold text-gray-900 mb-5">
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
                  <time dateTime={article.created_at} className="text-xs text-gray-400 mt-2 block">
                    {formatDate(article.created_at)}
                  </time>
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
