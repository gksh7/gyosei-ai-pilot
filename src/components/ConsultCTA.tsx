"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { useState } from "react";

type Props = {
  /** どこから押されたか */
  source: "diagnosis" | "chat" | "article";
  /** リスクレベル・質問・記事スラッグなど */
  context?: string;
  /** チャットウィジェット内などの省スペース表示 */
  compact?: boolean;
};

/**
 * 「行政書士に相談したい」需要計測ボタン。
 * 連絡先は集めない・返信の約束もしない。押されたことだけを記録する。
 */
export default function ConsultCTA({ source, context, compact }: Props) {
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    setClicked(true);
    try {
      sendGAEvent("event", "consult_interest", { source });
    } catch {
      /* noop */
    }
    fetch("/api/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, context }),
    }).catch(() => {
      /* noop */
    });
  }

  if (compact) {
    return clicked ? (
      <p className="px-1 text-[11px] text-gray-500">
        ご関心ありがとうございます。相談窓口は準備中です。
      </p>
    ) : (
      <button
        onClick={handleClick}
        className="px-1 text-left text-[11px] text-blue-600 underline underline-offset-2"
      >
        この件を行政書士に相談したい
      </button>
    );
  }

  if (clicked) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-gray-700">
        ご関心ありがとうございます。<strong>行政書士への相談窓口は現在準備中</strong>です。
        ご要望の多い分野から順次整えます。それまでは、各記事の解説と、
        必要に応じてお住まいの都道府県の行政書士会が実施する無料相談をご利用ください。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4">
      <p className="mb-1 text-sm font-semibold text-gray-800">
        具体的なケースを行政書士に相談したいですか？
      </p>
      <p className="mb-3 text-xs text-gray-500">
        相談窓口を準備中です。ご要望をお聞かせください（入力不要・ワンクリック）。
      </p>
      <button
        onClick={handleClick}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
      >
        行政書士に相談したい
      </button>
    </div>
  );
}
