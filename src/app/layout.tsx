import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={geist.className}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex flex-col">
              <span className="text-xs text-blue-600 font-medium">Legal AI Pilot</span>
              <span className="text-lg font-bold text-gray-900 leading-tight">
                行政書士AI Pilot
              </span>
            </a>
            <nav className="flex gap-6 text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600 transition-colors">記事一覧</a>
              <a href="/diagnosis" className="hover:text-blue-600 transition-colors">コンプライアンス診断</a>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
            © 2026 行政書士AI Pilot. AIが毎日収集・解説する法務情報メディア。
          </div>
        </footer>
      </body>
    </html>
  );
}
