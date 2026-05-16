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
  metadataBase: new URL("https://gyosei-ai-pilot.com"),
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
            <div className="flex justify-center gap-4 mb-3">
              <a
                href="https://x.com/GyoseiAIPilot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/gyosei_ai_pilot/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
            © 2026 行政書士AI Pilot
          </div>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-KEFDKT6RHW" />
    </html>
  );
}
