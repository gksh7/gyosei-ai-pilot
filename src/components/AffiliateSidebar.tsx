import Link from "next/link";
import type { Affiliate } from "@/lib/types";

export default function AffiliateSidebar({
  affiliates,
  articleId,
}: {
  affiliates: Affiliate[];
  articleId?: string;
}) {
  if (affiliates.length === 0 && !articleId) return null;

  return (
    <aside className="w-full md:w-52 md:shrink-0 mt-4 md:mt-0">

      {/* 診断CTAカード（記事ページ・スマホのみ） */}
      {articleId && (
        <div
          className="md:hidden rounded-xl p-6 mb-20 text-white"
          style={{ backgroundColor: "#0c2461" }}
        >
          <p className="text-blue-200 text-base font-medium mb-1">無料・即時診断</p>
          <p className="text-xl font-bold mb-4">あなたの会社は大丈夫？</p>
          <Link
            href="/diagnosis"
            className="diagnosis-btn inline-flex items-center justify-center gap-1.5 w-full text-base font-bold px-3 py-3 rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            コンプライアンス診断を始める
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {affiliates.length > 0 && (
        <div className="md:sticky md:top-[100px]">
          {/* 記事ページではデスクトップh2を非表示（ヘッダー行に移動済み）、ホームでは表示 */}
          <h2 className={`text-xl [@media(min-width:1024px)]:text-2xl font-bold text-gray-900 mb-3 ${articleId ? 'md:hidden' : 'md:mb-1'}`}>関連サービス</h2>
          {!articleId && <p className="hidden md:block text-xs text-gray-400 mb-5">※広告を含む場合があります</p>}
          <div className="flex flex-col gap-3">
            {affiliates.map((affiliate) => (
              <a
                key={affiliate.id}
                href={`/api/affiliate-click?id=${affiliate.id}${articleId ? `&article_id=${articleId}` : ""}`}
                target="_blank"
                rel="nofollow noopener noreferrer sponsored"
                className="relative block p-4 pr-8 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-400 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden md:block absolute top-3 right-3 text-amber-700" aria-hidden="true">
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
                <p className="text-base font-semibold text-gray-800">{affiliate.service_name}</p>
                {affiliate.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{affiliate.description}</p>
                )}
                <span className="md:hidden text-xs text-amber-700 font-medium mt-2 block">詳細を見る →</span>
              </a>
            ))}
          </div>
          <p className="md:hidden text-xs text-gray-400 mt-5">※広告を含む場合があります</p>
        </div>
      )}
    </aside>
  );
}
