import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "運営者情報｜行政書士AI Pilot",
  description:
    "行政書士AI Pilot（gyosei-ai-pilot.com）の運営者情報。サイトの目的・運営者・連絡先についてご案内します。",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "運営者情報｜行政書士AI Pilot",
    description: "行政書士AI Pilotの運営者情報。サイトの目的・運営者・連絡先をご案内します。",
    type: "website",
    url: `${SITE_URL}/about`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "運営者情報｜行政書士AI Pilot",
    description: "行政書士AI Pilotの運営者情報。サイトの目的・運営者・連絡先をご案内します。",
    images: [OGP_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "運営者情報", item: `${SITE_URL}/about` },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1010px] mx-auto px-6 min-[1042px]:px-0 pt-4 pb-8 sm:pt-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "運営者情報" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-8">運営者情報</h1>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">サイト概要</h2>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {[
                  ["サイト名", "行政書士AI Pilot｜2026法改正ナビ"],
                  ["URL", "https://gyosei-ai-pilot.com"],
                  ["開設日", "2026年4月"],
                  ["運営者", "AI Pilot Lab"],
                  ["お問い合わせ", "お問い合わせページよりご連絡ください"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100">
                    <th className="py-3 pr-6 text-left font-medium text-gray-600 w-32 align-top">
                      {label}
                    </th>
                    <td className="py-3 text-gray-800">
                      {label === "URL" ? (
                        <a href="https://gyosei-ai-pilot.com" className="text-blue-600 underline">
                          {value}
                        </a>
                      ) : label === "お問い合わせ" ? (
                        <a href="/contact" className="text-blue-600 underline">
                          お問い合わせページ
                        </a>
                      ) : (
                        value
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">サイトの目的</h2>
            <p>
              本サイトは、2026年1月1日施行の改正行政書士法をはじめとする行政手続きに関する法規制を、
              コンサルティング・人材・通信教育などの企業の法務・コンプライアンス担当者に向けてわかりやすく解説することを目的としています。
            </p>
            <p className="mt-2">
              官公庁が公表する情報をAIが毎日収集・解説し、「知らずに法律違反を犯すリスク」を防ぐ実務ガイドを提供します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">AIコンテンツについて</h2>
            <p>
              本サイトの記事はClaude（Anthropic社）などのAIが官公庁・報道機関の公開情報をもとに生成しています。
              内容の正確性には万全を期していますが、法的助言・専門家の意見の代替となるものではありません。
              実際の法的判断・手続きは必ず専門家（行政書士・弁護士等）にご相談ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">著作権</h2>
            <p>
              本サイトに掲載されているコンテンツ（文章・画像等）の著作権は運営者に帰属します。
              無断転載・複製は禁止します。
              引用の際は出典（サイト名・URL）を明記してください。
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
