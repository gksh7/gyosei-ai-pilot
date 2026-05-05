import { supabase } from "@/lib/supabase";
import type { Article, Source } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600;

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
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.created_at,
      url,
      siteName: "行政書士AI Pilot｜2026法改正ナビ",
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
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

  const sources = await getSources(article.source_ids ?? []);

  return (
    <article>
      <div className="mb-6">
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
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
          {article.title}
        </h1>
        <p className="text-sm text-gray-400">{formatDate(article.created_at)}</p>
      </div>

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
    </article>
  );
}
