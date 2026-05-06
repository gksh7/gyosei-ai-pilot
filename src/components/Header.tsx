"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50" style={{ borderTop: "5px solid #1e5da9" }}>
        <div className="max-w-[1010px] mx-auto px-4 min-[1042px]:px-0 py-2 sm:py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="ロゴ" width={38} height={38} className="w-10 h-10 sm:w-[42px] sm:h-[42px]" />
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-medium leading-none" style={{ color: '#23449c' }}>Legal AI Pilot</span>
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none whitespace-nowrap" style={{ textIndent: '-0.1em' }}>
                行政書士AI Pilot
              </span>
            </div>
          </Link>

          {/* PC nav */}
          <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-600 shrink-0">
            <Link href="/articles" className="transition-all hover:[color:#1e5da9] hover:font-bold">記事一覧</Link>
            <span className="text-gray-300 select-none">|</span>
            <Link href="/diagnosis" className="transition-all hover:[color:#1e5da9] hover:font-bold">コンプライアンス診断</Link>
          </nav>

          {/* ハンバーガーボタン（スマホのみ） */}
          <button
            className="sm:hidden p-1.5 text-gray-600"
            onClick={() => setOpen(!open)}
            aria-label="メニュー"
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
        onClick={() => setOpen(false)}
      />

      {/* 右スライドパネル */}
      <div
        className="fixed top-0 right-0 h-full w-64 bg-white z-50 sm:hidden shadow-xl"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        {/* 閉じるボタン */}
        <div className="flex justify-end px-4 py-2">
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-600"
            aria-label="閉じる"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-6 py-4 gap-7 text-base text-gray-700">
          <Link href="/articles" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>
            記事一覧
          </Link>
          <Link href="/diagnosis" className="hover:text-blue-600 transition-colors" onClick={() => setOpen(false)}>
            コンプライアンス診断
          </Link>
        </nav>
      </div>
    </>
  );
}
