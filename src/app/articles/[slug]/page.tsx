import { supabase } from "@/lib/supabase";
import type { Article, Source } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import ConsultCTA from "@/components/ConsultCTA";
import PageTracker from "./PageTracker";
import { getMatchingAffiliates } from "@/lib/affiliates";
import AffiliateSidebar from "@/components/AffiliateSidebar";

export const revalidate = 3600; // ISR: 1h

async function getArticle(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data;
}

type SourceSummary = Pick<Source, "id" | "name" | "url" | "tier">

async function getSources(sourceIds: string[]): Promise<SourceSummary[]> {
  if (!sourceIds || sourceIds.length === 0) return [];
  const { data } = await supabase
    .from("sources")
    .select("id, name, url, tier")
    .in("id", sourceIds)
    .order("tier");
  return (data as SourceSummary[]) ?? [];
}

type AdjacentArticle = Pick<Article, "slug" | "title">;

async function getAdjacentArticles(createdAt: string): Promise<{ prev: AdjacentArticle | null; next: AdjacentArticle | null }> {
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    supabase
      .from("articles")
      .select("slug, title")
      .eq("status", "published")
      .lt("created_at", createdAt)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("articles")
      .select("slug, title")
      .eq("status", "published")
      .gt("created_at", createdAt)
      .order("created_at", { ascending: true })
      .limit(1)
      .single(),
  ]);
  return { prev: prevData ?? null, next: nextData ?? null };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const title = article.seo_title ?? article.title;
  const description = article.seo_description ?? article.summary ?? undefined;
  const url = `${SITE_URL}/articles/${slug}`;
  return {
    title,
    description,
    keywords: article.tags ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      tags: article.tags ?? undefined,
      url,
      siteName: "行政書士AI Pilot｜2026法改正ナビ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      "twitter:url": url,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  });
}


export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const [sources, { prev, next }, affiliates] = await Promise.all([
    getSources(article.source_ids ?? []),
    getAdjacentArticles(article.created_at),
    getMatchingAffiliates(article.tags ?? []),
  ]);

  const articleUrl = `${SITE_URL}/articles/${article.slug}`;

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.seo_description ?? article.summary ?? undefined,
    datePublished: article.created_at,
    dateModified: article.updated_at,
    url: articleUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    author: { "@type": "Organization", name: "行政書士AI Pilot" },
    publisher: {
      "@type": "Organization",
      name: "行政書士AI Pilot｜2026法改正ナビ",
      url: SITE_URL,
    },
    ...(article.og_image_url && { image: article.og_image_url }),
  };

  const faqJsonLd = article.faq && article.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "記事一覧", item: `${SITE_URL}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <div className="max-w-[1010px] mx-auto px-6 min-[1042px]:px-0 pt-4 pb-8 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <PageTracker articleId={article.id} />
      <Breadcrumb items={[{ label: "トップ", href: "/" }, { label: "記事一覧", href: "/articles" }, { label: article.title }]} />
      {/* ヘッダー行：記事タイトルエリア ＋ デスクトップ「関連サービス」h2 */}
      <div className="mb-6 md:flex md:flex-row md:gap-9 lg:gap-14 md:items-start">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-4 flex-wrap">
            {article.tags?.map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-[27px] md:text-[30px] font-bold text-gray-900 leading-snug mb-3">
            {article.title}
          </h1>
          <time dateTime={article.created_at} className="text-sm text-gray-400">
            {formatDate(article.created_at)}
          </time>
        </div>
        {/* 左のタグ行と同じ高さの invisible プレースホルダーで h1 に揃える */}
        <div className="hidden md:block md:w-52 md:shrink-0">
          <div className="mb-4 invisible" aria-hidden="true">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">&nbsp;</span>
          </div>
          <h2 className="text-xl [@media(min-width:1024px)]:text-2xl font-bold text-gray-900 mb-3">関連サービス</h2>
          <p className="text-xs text-gray-400">※広告を含む場合があります</p>
        </div>
      </div>

    <div className="flex flex-col md:flex-row gap-8 md:gap-9 lg:gap-14">
    <article className="flex-1 min-w-0">
      {article.summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
          <p className="text-sm font-medium text-blue-700 mb-1">要約</p>
          <p className="text-gray-700 leading-relaxed">{article.summary}</p>
        </div>
      )}

      <div
        className="prose prose-gray max-w-none leading-loose"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.faq && article.faq.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">よくある質問</h2>
          <dl className="space-y-4">
            {article.faq.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5">
                <dt className="font-semibold text-gray-800 mb-2 flex gap-2">
                  <span className="text-blue-600 shrink-0">Q.</span>
                  {item.question}
                </dt>
                <dd className="text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-gray-400 shrink-0">A.</span>
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-gray-200">
        <ConsultCTA source="article" context={article.slug} />
      </div>

      {sources.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-3">参考情報源</p>
          <ul className="space-y-1.5">
            {sources.map((source: SourceSummary) => (
              <li key={source.id}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(prev || next) && (
        <div className="mt-10 pt-6 border-t border-gray-200 grid grid-cols-2 gap-3">
          <div>
            {prev && (
              <Link
                href={`/articles/${prev.slug}`}
                className="flex flex-col gap-1 p-4 bg-white border border-gray-300 rounded-xl hover:border-blue-400 hover:shadow-sm hover:scale-[1.02] transition-all duration-200 h-full"
              >
                <span className="text-xs text-gray-400">← 前の記事</span>
                <span className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">{prev.title}</span>
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link
                href={`/articles/${next.slug}`}
                className="flex flex-col gap-1 p-4 bg-white border border-gray-300 rounded-xl hover:border-blue-400 hover:shadow-sm hover:scale-[1.02] transition-all duration-200 text-right h-full"
              >
                <span className="text-xs text-gray-400">次の記事 →</span>
                <span className="text-sm font-medium text-gray-700 leading-snug line-clamp-2">{next.title}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
    <AffiliateSidebar affiliates={affiliates} articleId={article.id} />
    </div>

    {/* 診断CTAバナー（デスクトップのみ・フッター上） */}
    <div
      className="hidden md:flex items-center justify-between rounded-2xl px-10 py-8 mt-12 mb-12"
      style={{ backgroundColor: "#0c2461" }}
    >
      <div>
        <p className="text-blue-200 text-base font-medium mb-1">無料・即時診断</p>
        <p className="text-2xl lg:text-3xl font-bold text-white">あなたの会社は大丈夫？</p>
      </div>
      <Link
        href="/diagnosis"
        className="diagnosis-btn inline-flex items-center gap-2 text-xl font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] shrink-0"
      >
        コンプライアンス診断を始める
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
    </div>
  );
}
