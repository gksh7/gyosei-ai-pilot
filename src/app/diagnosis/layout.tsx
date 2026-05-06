import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gyosei-ai-pilot.com";
const OGP_IMAGE = `${SITE_URL}/ogp.png`;

export const metadata: Metadata = {
  title: "コンプライアンス診断｜行政書士AI Pilot",
  description:
    "2026年改正行政書士法への対応状況をAIが無料診断。コンサル・人材・通信教育企業の「知らずに違反」リスクを7問でチェック。第19条・両罰規定への対応状況を即時フィードバック。",
  alternates: { canonical: `${SITE_URL}/diagnosis` },
  openGraph: {
    title: "コンプライアンス診断｜行政書士AI Pilot",
    description:
      "2026年改正行政書士法への対応状況をAIが無料診断。7問に答えるだけで法務リスクを即時チェック。",
    type: "website",
    url: `${SITE_URL}/diagnosis`,
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    images: [{ url: OGP_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "コンプライアンス診断｜行政書士AI Pilot",
    description:
      "2026年改正行政書士法への対応状況をAIが無料診断。7問に答えるだけで法務リスクを即時チェック。",
    images: [OGP_IMAGE],
  },
};

export default function DiagnosisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
