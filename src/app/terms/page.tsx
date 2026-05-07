import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "利用規約｜行政書士AI Pilot",
  description:
    "行政書士AI Pilot（gyosei-ai-pilot.com）の利用規約。免責事項・著作権・禁止事項・リンクポリシーを定めます。",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "利用規約｜行政書士AI Pilot",
    description: "行政書士AI Pilotの利用規約。免責事項・著作権・禁止事項を定めます。",
    type: "website",
    url: `${SITE_URL}/terms`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "利用規約｜行政書士AI Pilot",
    description: "行政書士AI Pilotの利用規約。免責事項・著作権・禁止事項を定めます。",
    images: [OGP_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "利用規約", item: `${SITE_URL}/terms` },
  ],
};

export default function TermsPage() {
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
            { label: "利用規約" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-8">利用規約</h1>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <p>
            本利用規約（以下「本規約」）は、行政書士AI Pilot（以下「当サイト」）の利用に関する条件を定めるものです。
            当サイトをご利用の方（以下「ユーザー」）は、本規約に同意のうえご利用ください。
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第1条（免責事項）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                当サイトに掲載する情報は、AIが官公庁・報道機関等の公開情報をもとに生成したものです。
                情報の正確性・完全性・最新性を保証するものではありません。
              </li>
              <li>
                当サイトの情報は法的助言・専門家の意見の代替ではありません。
                具体的な法的判断・手続きについては、行政書士・弁護士等の有資格者にご相談ください。
              </li>
              <li>
                当サイトの情報を利用したことにより生じたいかなる損害についても、
                運営者は一切の責任を負いません。
              </li>
              <li>
                当サイトはシステムメンテナンス・障害等により予告なく一時停止・終了する場合があります。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第2条（著作権）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                当サイトに掲載されているコンテンツ（文章・画像・ロゴ等）の著作権は運営者に帰属します。
              </li>
              <li>
                コンテンツの無断転載・複製・改変・再配布は禁止します。
              </li>
              <li>
                引用の際は、出典（サイト名および元記事URL）を明記してください。
                引用の範囲は著作権法上の範囲に限ります。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第3条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>当サイトへの不正アクセス・サーバーへの過負荷をかける行為</li>
              <li>当サイトのコンテンツを無断で商業利用する行為</li>
              <li>当サイトの運営を妨害する行為</li>
              <li>法令または公序良俗に反する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第4条（外部リンク）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                当サイトから外部サイトへのリンクを掲載することがありますが、
                リンク先サイトの内容について運営者は責任を負いません。
              </li>
              <li>
                当サイトへのリンクは原則として自由ですが、
                誤解を招く形でのリンク（内容を歪曲する文脈でのリンク等）はお断りします。
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第5条（広告・アフィリエイト）</h2>
            <p>
              当サイトは第三者の広告サービスおよびアフィリエイトプログラムを利用する場合があります。
              広告収入は当サイトの運営・維持に使用します。
              掲載広告の内容について運営者は保証しません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第6条（準拠法・管轄）</h2>
            <p>
              本規約の解釈には日本法を準拠法とし、紛争が生じた場合は運営者の所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第7条（規約の変更）</h2>
            <p>
              運営者は必要に応じて本規約を変更できるものとします。
              変更後の規約は本ページに掲載した時点より効力を生じます。
            </p>
          </section>

          <p className="text-xs text-gray-400 mt-10 pt-6 border-t border-gray-200">
            制定日：2026年5月7日
          </p>
        </div>
      </div>
    </>
  );
}
