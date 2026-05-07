"use client";

import { useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { DIAGNOSIS_DISCLAIMER } from "@/lib/gyosei-law";

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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
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

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
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

        <p className="text-xs text-gray-400 leading-relaxed px-1 pt-2 border-t border-gray-100">
          ※ {DIAGNOSIS_DISCLAIMER}
        </p>
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
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "コンプライアンス診断" }]} />
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-base font-semibold text-gray-900 mb-5">{currentQ.question}</p>
        <div className="space-y-2.5">
          {currentQ.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 bg-white rounded-lg border-2 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-500 cursor-pointer shadow-sm transition-all"
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
