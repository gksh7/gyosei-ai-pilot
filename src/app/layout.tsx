import type { Metadata } from "next";
import { Geist, Noto_Sans_JP } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Header from "@/components/Header";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gyosei-ai-pilot.com"),
  title: {
    default: "行政書士AI Pilot｜2026法改正ナビ",
    template: "%s | 行政書士AI Pilot",
  },
  description:
    "2026年改正行政書士法、あなたの会社は大丈夫？コンサル・人材・通信教育企業の「知らずに違反」を防ぐAI法務ナビ。官公庁情報をAIが毎日収集・解説します。",
  openGraph: {
    siteName: "行政書士AI Pilot｜2026法改正ナビ",
    locale: "ja_JP",
    type: "website",
  },
  verification: {
    google: "sfZhUVnorEk2no97tk-BquMr85puruih7Yez2ppsYPU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${geist.className} ${notoSansJP.variable}`}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main>
          {children}
        </main>
        <footer className="mt-5" style={{ backgroundColor: 'rgba(12, 36, 97, 0.03)', borderTop: '1px solid rgba(12, 36, 97, 0.05)' }}>
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
            <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 text-xs">
              <a href="/about" className="hover:text-gray-700 transition-colors">運営者情報</a>
              <span className="text-gray-300 select-none">|</span>
              <a href="/privacy" className="hover:text-gray-700 transition-colors">プライバシーポリシー</a>
              <span className="text-gray-300 select-none">|</span>
              <a href="/terms" className="hover:text-gray-700 transition-colors">利用規約</a>
              <span className="text-gray-300 select-none">|</span>
              <a href="/tokutei" className="hover:text-gray-700 transition-colors">特定商取引法</a>
              <span className="text-gray-300 select-none">|</span>
              <a href="/contact" className="hover:text-gray-700 transition-colors">お問い合わせ</a>
            </nav>
            © 2026 行政書士AI Pilot
          </div>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-KEFDKT6RHW" />
    </html>
  );
}
