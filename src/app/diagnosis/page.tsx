"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { DIAGNOSIS_DISCLAIMER } from "@/lib/gyosei-law";
import type { Affiliate } from "@/lib/types";

const QUESTIONS = [
  {
    question: "貴社の業種を教えてください",
    options: [
      "コンサルティング・経営支援",
      "人材・派遣・採用支援",
      "通信教育・eラーニング",
      "IT・SaaS・テック",
      "その他",
    ],
  },
  {
    question: "行政手続き（許認可申請・補助金申請・在留資格申請等）に関するサービスを提供していますか？",
    options: [
      "はい、代行・サポートサービスを提供している",
      "一部のサービスで関わることがある",
      "いいえ、提供していない",
    ],
  },
  {
    question: "そのサービスは反復継続的に（＝業として）提供していますか？",
    options: [
      "はい、継続的に提供している",
      "案件単位・スポットで対応している",
      "提供していない",
    ],
  },
  {
    question: "料金体系について：書類作成にあたる作業を「コンサル料」「システム利用料」「アドバイス料」など別名目で請求していませんか？",
    options: [
      "明確に分けていない・別名目で請求している",
      "書類作成は行政書士に外注し、料金も区別している",
      "そもそも書類作成業務は行っていない",
    ],
  },
  {
    question: "社内に行政書士の資格保持者はいますか？",
    options: [
      "はい、在籍している",
      "いいえ、いない",
      "わからない",
    ],
  },
  {
    question: "外部の行政書士と正式な業務提携をしていますか？",
    options: [
      "はい、正式に提携している",
      "非公式に相談している程度",
      "いいえ、提携していない",
    ],
  },
  {
    question: "2026年改正行政書士法の内容を把握していますか？",
    options: [
      "詳しく把握している",
      "概要は知っている",
      "ほとんど知らない",
    ],
  },
];

type Result = {
  riskLevel: "高" | "中" | "低";
  riskLabel: string;
  summary: string;
  issues: string[];
  actions: string[];
  message: string;
};

const riskStyles: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  高: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  中: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  低: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
  },
};

export default function DiagnosisPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [allAffiliates, setAllAffiliates] = useState<Affiliate[]>([]);

  useEffect(() => {
    fetch("/api/affiliates").then((r) => r.json()).then(setAllAffiliates).catch(() => {});
  }, []);

  const currentQ = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  async function handleSelect(option: string) {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/diagnosis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: newAnswers }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResult(data);
      } catch {
        setError("診断に失敗しました。もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    }
  }

  function handleReset() {
    setStep(0);
    setAnswers([]);
    setResult(null);
    setError("");
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">AIが診断中です...</p>
      </div>
    );
  }

  if (result) {
    const styles = riskStyles[result.riskLevel];
    const diagnosisAffiliates = allAffiliates
      .filter((a) => {
        const riskTags = (a.categories ?? []).filter((c) => c.startsWith("risk:"));
        // risk:XXX タグがなければ全リスクに表示
        if (riskTags.length === 0) return true;
        return riskTags.includes(`risk:${result.riskLevel}`);
      })
      .slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6 max-w-lg mx-auto">
        <div className={`rounded-2xl border p-6 ${styles.bg} ${styles.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${styles.badge}`}>
              リスク{result.riskLevel} · {result.riskLabel}
            </span>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${styles.text}`}>{result.summary}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{result.message}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-300 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⚠️ 確認が必要なポイント</h3>
          <ul className="space-y-2">
            {result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-red-400 mt-0.5 shrink-0">●</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-300 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">✅ 推奨アクション</h3>
          <ul className="space-y-2">
            {result.actions.map((action, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">{i + 1}.</span>
                {action}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed px-1 pt-4">
          ※ {DIAGNOSIS_DISCLAIMER}
        </p>

        <div className="bg-gray-900 rounded-xl p-5 text-white text-center">
          <p className="text-sm font-semibold mb-1">毎日の法改正情報をXでチェック</p>
          <p className="text-xs text-gray-400 mb-4">改正行政書士法の最新情報・対策記事を毎日19時に投稿しています</p>
          <a
            href="https://twitter.com/intent/follow?screen_name=GyoseiAIPilot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.735-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            @GyoseiAIPilot をフォロー
          </a>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 text-sm text-gray-600 bg-white border border-gray-300 rounded-xl hover:border-blue-300 transition-colors"
          >
            もう一度診断する
          </button>
          <Link
            href="/"
            className="flex-1 py-3 text-sm text-center text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            記事を読む
          </Link>
        </div>

        {diagnosisAffiliates.length > 0 && (
          <div className="!mt-10 pt-4 border-t border-gray-100">
            <p className="text-xl font-bold text-gray-900 mb-3">関連サービス</p>
            <div className="space-y-3">
              {diagnosisAffiliates.map((affiliate) => (
                <a
                  key={affiliate.id}
                  href={`/api/affiliate-click?id=${affiliate.id}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-800">{affiliate.service_name}</p>
                    {affiliate.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{affiliate.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-amber-700 font-medium ml-3 shrink-0">詳細を見る →</span>
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-5">※ 広告を含む場合があります</p>
          </div>
        )}
      </div>
      </div>
    );
  }

  const SITE_URL = "https://gyosei-ai-pilot.com";

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "コンプライアンス診断｜行政書士AI Pilot",
    url: `${SITE_URL}/diagnosis`,
    description:
      "2026年改正行政書士法への対応状況をAIが無料で診断。コンサル・人材・通信教育企業の「知らずに違反」リスクを7問でチェック。",
    isPartOf: { "@type": "WebSite", url: SITE_URL },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "コンプライアンス診断", item: `${SITE_URL}/diagnosis` },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 sm:pt-8">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div className="max-w-lg mx-auto space-y-6">
      <Breadcrumb items={[{ label: "トップ", href: "/" }, { label: "コンプライアンス診断" }]} />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">コンプライアンス診断</h1>
        <p className="text-gray-500 text-sm">2026年改正行政書士法への対応状況をAIが診断します</p>
      </div>

      {/* プログレスバー */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400">
          <span>質問 {step + 1} / {QUESTIONS.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 質問カード */}
      <div className="bg-white rounded-xl border border-gray-300 p-6">
        <p className="text-base font-semibold text-gray-900 mb-5">{currentQ.question}</p>
        <div className="space-y-2.5">
          {currentQ.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-3 text-sm text-blue-900 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-400 cursor-pointer shadow-sm transition-all"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <p className="text-xs text-gray-400 leading-relaxed px-1">
        ※ {DIAGNOSIS_DISCLAIMER}
      </p>
    </div>
    </div>
  );
}
