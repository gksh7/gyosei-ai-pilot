'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Article } from '@/lib/types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  });
}

export function ArticleList({ articles }: { articles: Article[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = ref.current?.querySelectorAll<HTMLElement>('.article-animate');
    if (!items) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="space-y-4">
      {articles.map((article, i) => (
        <Link
          key={article.id}
          href={`/articles/${article.slug}`}
          className="article-animate block bg-white rounded-xl border border-gray-300 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className="flex gap-2 mb-2 flex-wrap">
            {article.tags?.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1.5 leading-snug">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-gray-600 text-sm leading-relaxed">{article.summary}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <time dateTime={article.created_at} className="text-xs text-gray-400">
              {formatDate(article.created_at)}
            </time>
            <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
              続きを読む
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
