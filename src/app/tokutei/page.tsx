import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記｜行政書士AI Pilot",
  description:
    "行政書士AI Pilot（gyosei-ai-pilot.com）の特定商取引法に基づく表記。販売業者・連絡先・サービス内容等を記載しています。",
  alternates: { canonical: `${SITE_URL}/tokutei` },
  openGraph: {
    title: "特定商取引法に基づく表記｜行政書士AI Pilot",
    description: "行政書士AI Pilotの特定商取引法に基づく表記。",
    type: "website",
    url: `${SITE_URL}/tokutei`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "特定商取引法に基づく表記｜行政書士AI Pilot",
    description: "行政書士AI Pilotの特定商取引法に基づく表記。",
    images: [OGP_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "特定商取引法に基づく表記", item: `${SITE_URL}/tokutei` },
  ],
};

const ITEMS: { label: string; value: string }[] = [
  { label: "販売業者", value: "AI Pilot Lab（個人運営・氏名は請求があれば開示します）" },
  { label: "所在地", value: "請求があれば遅滞なく開示します" },
  { label: "電話番号", value: "請求があれば遅滞なく開示します" },
  { label: "サービス名称", value: "行政書士AI Pilot｜2026法改正ナビ" },
  { label: "サービスURL", value: "https://gyosei-ai-pilot.com" },
  { label: "提供サービス", value: "行政書士法・行政手続きに関する情報提供（無料）" },
  { label: "販売価格", value: "無料（一部コンテンツでアフィリエイト広告を含む）" },
  { label: "支払方法", value: "現在、有料サービスは提供していません" },
  { label: "役務の提供時期", value: "コンテンツ公開後、即時閲覧可能" },
  { label: "返品・キャンセル", value: "情報提供サービスのため、返品・キャンセルは適用されません" },
];

export default function TokuteiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1010px] mx-auto px-6 min-[1042px]:px-0 pt-4 pb-8 sm:pt-8">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "特定商取引法に基づく表記" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>

        <div className="text-sm text-gray-700">
          <table className="w-full border-collapse">
            <tbody>
              {ITEMS.map(({ label, value }) => (
                <tr key={label} className="border-b border-gray-100">
                  <th className="py-4 pr-6 text-left font-medium text-gray-600 w-40 align-top leading-relaxed">
                    {label}
                  </th>
                  <td className="py-4 text-gray-800 leading-relaxed">
                    {label === "メールアドレス" ? (
                      <a href="/contact" className="text-blue-600 underline">
                        お問い合わせページ
                      </a>
                    ) : label === "サービスURL" ? (
                      <a href="https://gyosei-ai-pilot.com" className="text-blue-600 underline">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed">
            <p>
              ※ 所在地・電話番号について：個人情報保護の観点から公表を控えていますが、
              請求があった場合は遅滞なく開示いたします。
              <a href="/contact" className="text-blue-600 underline ml-1">
                お問い合わせページ
              </a>
              よりご連絡ください。
            </p>
          </div>

          <p className="text-xs text-gray-400 mt-8 pt-6 border-t border-gray-200">
            制定日：2026年5月7日
          </p>
        </div>
      </div>
    </>
  );
}
