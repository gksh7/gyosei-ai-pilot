import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "記事一覧｜行政書士AI Pilot",
  description:
    "2026年改正行政書士法に関する最新記事の一覧。官公庁情報をAIが毎日収集・解説。許認可申請・補助金・在留資格など実務に役立つコンプライアンス情報を掲載。",
  alternates: { canonical: `${SITE_URL}/articles` },
  openGraph: {
    title: "記事一覧｜行政書士AI Pilot",
    description: "2026年改正行政書士法に関する最新記事。AIが官公庁情報を毎日収集・解説します。",
    type: "website",
    url: `${SITE_URL}/articles`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "記事一覧｜行政書士AI Pilot",
    description: "2026年改正行政書士法に関する最新記事。AIが官公庁情報を毎日収集・解説します。",
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
    timeZone: "Asia/Tokyo",
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { articles, total } = await getArticles(page);
  const totalPages = Math.ceil(total / PER_PAGE);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "記事一覧", item: `${SITE_URL}/articles` },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "記事一覧｜行政書士AI Pilot",
    url: `${SITE_URL}/articles`,
    description: "2026年改正行政書士法に関するAI生成記事の一覧。官公庁の最新情報を毎日収集・解説します。",
    isPartOf: { "@type": "WebSite", url: SITE_URL },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "記事一覧",
    url: `${SITE_URL}/articles`,
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PER_PAGE + i + 1,
      name: article.title,
      url: `${SITE_URL}/articles/${article.slug}`,
    })),
  };

  return (
    <div className="max-w-[1010px] mx-auto px-6 min-[1042px]:px-0 pt-4 pb-8 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "記事一覧" }]} />
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">記事一覧</h1>
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
                <h2 className="text-base font-semibold text-gray-900 mt-3 mb-1.5 leading-snug">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/articles?page=${page - 1}`}
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
                  href={`/articles?page=${page + 1}`}
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
  );
}
