import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.summary ?? undefined,
    openGraph: {
      title: article.seo_title ?? article.title,
      description: article.seo_description ?? article.summary ?? undefined,
      type: "article",
      publishedTime: article.created_at,
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
        className="prose prose-gray max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
