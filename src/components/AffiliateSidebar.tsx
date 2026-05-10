import type { Affiliate } from "@/lib/types";

export default function AffiliateSidebar({
  affiliates,
  articleId,
}: {
  affiliates: Affiliate[];
  articleId?: string;
}) {
  if (affiliates.length === 0) return null;

  return (
    <aside className="w-full md:w-52 md:shrink-0">
      <div className="md:sticky md:top-[100px]">
        <div className="space-y-3">
          {affiliates.map((affiliate) => (
            <a
              key={affiliate.id}
              href={`/api/affiliate-click?id=${affiliate.id}${articleId ? `&article_id=${articleId}` : ""}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block p-4 bg-amber-50 border border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all"
            >
              <p className="text-xs text-gray-400 mb-1">関連サービス</p>
              <p className="text-base font-semibold text-gray-800">{affiliate.service_name}</p>
              {affiliate.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{affiliate.description}</p>
              )}
              <span className="text-xs text-amber-700 font-medium mt-2 block">詳細を見る →</span>
            </a>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">※ 広告を含む場合があります</p>
      </div>
    </aside>
  );
}
