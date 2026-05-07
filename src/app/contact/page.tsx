import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import ContactForm from "./ContactForm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "お問い合わせ｜行政書士AI Pilot",
  description:
    "行政書士AI Pilot（gyosei-ai-pilot.com）へのお問い合わせはこちら。サイトの内容・掲載情報・その他のご質問をお受けしています。",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "お問い合わせ｜行政書士AI Pilot",
    description: "行政書士AI Pilotへのお問い合わせフォーム。",
    type: "website",
    url: `${SITE_URL}/contact`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "お問い合わせ｜行政書士AI Pilot",
    description: "行政書士AI Pilotへのお問い合わせフォーム。",
    images: [OGP_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "お問い合わせ", item: `${SITE_URL}/contact` },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 sm:pt-8">
        <div className="max-w-lg mx-auto space-y-6">
          <Breadcrumb
            items={[
              { label: "トップ", href: "/" },
              { label: "お問い合わせ" },
            ]}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">お問い合わせ</h1>
            <p className="text-sm text-gray-500">
              サイトの内容・掲載情報の誤り・その他のご質問はこちらからお送りください。
              通常3営業日以内にご返答します。
            </p>
          </div>

          <ContactForm />

          <p className="text-xs text-gray-400">
            ※ いただいた個人情報はお問い合わせへの対応のみに使用し、第三者には提供しません。
            詳細は
            <a href="/privacy" className="text-blue-600 underline ml-1">
              プライバシーポリシー
            </a>
            をご確認ください。
          </p>
        </div>
      </div>
    </>
  );
}
