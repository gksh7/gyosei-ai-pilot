import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "プライバシーポリシー｜行政書士AI Pilot",
  description:
    "行政書士AI Pilot（gyosei-ai-pilot.com）のプライバシーポリシー。個人情報の取扱い、Googleアナリティクスの利用、Cookieに関する方針を説明します。",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "プライバシーポリシー｜行政書士AI Pilot",
    description: "行政書士AI Pilotのプライバシーポリシー。個人情報の取扱い方針を説明します。",
    type: "website",
    url: `${SITE_URL}/privacy`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "プライバシーポリシー｜行政書士AI Pilot",
    description: "行政書士AI Pilotのプライバシーポリシー。個人情報の取扱い方針を説明します。",
    images: [OGP_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "プライバシーポリシー", item: `${SITE_URL}/privacy` },
  ],
};

export default function PrivacyPage() {
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
            { label: "プライバシーポリシー" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700 leading-relaxed">
          <p>
            行政書士AI Pilot（以下「当サイト」）は、ユーザーの個人情報の保護を重要な責務と考え、
            以下のとおりプライバシーポリシーを定めます。
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. 個人情報の収集</h2>
            <p>
              当サイトでは、お問い合わせフォームをご利用の際に、お名前・メールアドレス等の個人情報をご提供いただく場合があります。
              収集した個人情報は、お問い合わせへの回答・連絡のみに使用し、その他の目的には使用しません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. 個人情報の第三者提供</h2>
            <p>
              当サイトは、法令に基づく場合を除き、収集した個人情報を第三者に提供・開示することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. アクセス解析ツール（Google Analytics）</h2>
            <p>
              当サイトでは、Googleが提供するアクセス解析ツール「Google Analytics 4」を使用しています。
              Google Analyticsはトラフィックデータの収集のためにCookieを使用します。
              このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
            </p>
            <p className="mt-2">
              この機能はCookieを無効にすることで収集を拒否できます。
              Google Analyticsの利用規約および詳細については、
              <a
                href="https://marketingplatform.google.com/about/analytics/terms/jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline ml-1"
              >
                Google Analyticsサービス利用規約
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Cookieについて</h2>
            <p>
              当サイトはCookieを使用する場合があります。Cookieはウェブブラウザに保存される小さなテキストファイルです。
              ブラウザの設定によりCookieを無効化できますが、一部の機能が制限される場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. 広告・アフィリエイトについて</h2>
            <p>
              当サイトは、第三者配信の広告サービスおよびアフィリエイトプログラムを利用する場合があります。
              これらのサービスはCookieを使用して広告を配信することがあります。
              詳細については各サービスのプライバシーポリシーをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">6. 免責事項</h2>
            <p>
              当サイトに掲載されている情報の正確性については万全を期していますが、
              その内容の完全性・正確性・最新性を保証するものではありません。
              当サイトの情報を利用したことによる損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">7. プライバシーポリシーの変更</h2>
            <p>
              当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
              変更後のポリシーは本ページに掲載した時点より効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">8. お問い合わせ</h2>
            <p>
              個人情報の取扱いに関するお問い合わせは、
              <a href="/contact" className="text-blue-600 underline ml-1">お問い合わせページ</a>
              よりご連絡ください。
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
