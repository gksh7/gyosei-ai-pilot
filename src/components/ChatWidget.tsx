"use client";

import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { useEffect, useRef, useState } from "react";
import ConsultCTA from "@/components/ConsultCTA";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "gyosei-chat-v1";
const ACCENT = "#1e5da9";

const GREETING: Msg = {
  role: "assistant",
  content:
    "行政書士法・許認可のコンプライアンスについて、サイトの記事をもとにお答えします。気になることを入力してください。",
};

const SUGGESTIONS = [
  "無資格で許認可申請を代行すると違法？",
  "補助金申請の代行に資格は必要？",
  "両罰規定ってなに？",
  "古物商許可を自分で取る方法は？",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 復元（マウント後に localStorage から会話履歴を差し替える。SSR結果は GREETING 固定）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Msg[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部ストア(localStorage)からの1回限りの復元
        setMessages(parsed);
      }
    } catch {
      /* noop */
    }
  }, []);

  // 保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* noop */
    }
  }, [messages]);

  // 自動スクロール
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    try {
      sendGAEvent("event", "chat_message", { turn: next.length });
    } catch {
      /* noop */
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.content).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        let msg = "回答の取得に失敗しました。時間をおいてお試しください。";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* noop */
        }
        setMessages((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { role: "assistant", content: msg };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      if (!acc.trim()) {
        setMessages((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { role: "assistant", content: "うまく回答できませんでした。質問を変えてお試しください。" };
          return copy;
        });
      }
    } catch {
      setMessages((cur) => {
        const copy = [...cur];
        copy[copy.length - 1] = { role: "assistant", content: "通信エラーが発生しました。" };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([GREETING]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      {/* 起動ボタン */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            try {
              sendGAEvent("event", "chat_open");
            } catch {
              /* noop */
            }
          }}
          aria-label="AIアシスタントを開く"
          className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: ACCENT }}
        >
          <ChatIcon />
          <span className="text-sm font-bold">AIに質問</span>
        </button>
      )}

      {/* パネル */}
      {open && (
        <div className="fixed inset-0 z-[60] sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[600px] sm:w-[380px]">
          <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl sm:border sm:border-gray-200">
            {/* ヘッダー */}
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ backgroundColor: ACCENT }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold leading-tight">行政書士AI Pilot アシスタント</p>
                <p className="text-[11px] leading-tight text-white/80">サイト記事をもとに回答します</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  aria-label="会話をリセット"
                  className="rounded p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
                  title="会話をリセット"
                >
                  <ResetIcon />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="閉じる"
                  className="rounded p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* メッセージ */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} pending={loading && i === messages.length - 1 && !m.content} />
              ))}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-left text-xs text-gray-700 hover:border-gray-400 hover:bg-gray-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 入力 */}
            <div className="border-t border-gray-200 bg-white px-3 py-2.5">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  maxLength={1000}
                  placeholder="質問を入力（Enterで送信）"
                  className="max-h-28 flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  aria-label="送信"
                  className="rounded-lg px-3 py-2 text-white disabled:opacity-40"
                  style={{ backgroundColor: ACCENT }}
                >
                  <SendIcon />
                </button>
              </div>
              {messages.length > 2 && !loading && (
                <div className="mt-1.5">
                  <ConsultCTA
                    key={messages.length}
                    source="chat"
                    context={[...messages].reverse().find((m) => m.role === "user")?.content.slice(0, 200)}
                    compact
                  />
                </div>
              )}
              <p className="mt-1.5 text-[10px] leading-tight text-gray-400">
                AIによる回答です。正確性は保証されません。個別の判断は行政書士などの専門家にご相談ください。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ msg, pending }: { msg: Msg; pending: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed " +
          (isUser
            ? "rounded-br-sm bg-[#1e5da9] text-white"
            : "rounded-bl-sm border border-gray-200 bg-white text-gray-800")
        }
      >
        {pending ? <Dots /> : isUser ? msg.content : <Markdown text={msg.content} />}
      </div>
    </div>
  );
}

/** 最小限の Markdown レンダラ：リンク・箇条書き・強調・段落のみ。HTMLは注入しない。 */
function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key} className="my-1 list-disc space-y-0.5 pl-4">
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((line, i) => {
    const bullet = line.match(/^\s*[-・*]\s+(.*)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList(`ul-${i}`);
    const trimmed = line.trim();
    if (!trimmed || /^-{3,}$/.test(trimmed)) return;
    const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={`h-${i}`} className="my-1 font-semibold first:mt-0 last:mb-0">
          {inline(heading[1])}
        </p>,
      );
      return;
    }
    blocks.push(
      <p key={`p-${i}`} className="my-1 first:mt-0 last:mb-0">
        {inline(trimmed)}
      </p>,
    );
  });
  flushList("ul-end");

  return <>{blocks}</>;
}

function inline(s: string): React.ReactNode[] {
  // [text](href) と **bold** を処理
  const nodes: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) nodes.push(s.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2].trim();
      const label = m[1];
      if (href.startsWith("/")) {
        nodes.push(
          <Link key={k++} href={href} className="font-medium text-[#1e5da9] underline underline-offset-2">
            {label}
          </Link>,
        );
      } else if (/^https:\/\/(www\.)?gyosei-ai-pilot\.com\//.test(href)) {
        nodes.push(
          <a key={k++} href={href} className="font-medium text-[#1e5da9] underline underline-offset-2">
            {label}
          </a>,
        );
      } else {
        nodes.push(label);
      }
    } else if (m[3]) {
      nodes.push(
        <strong key={k++} className="font-semibold">
          {m[3]}
        </strong>,
      );
    }
    last = re.lastIndex;
  }
  if (last < s.length) nodes.push(s.slice(last));
  return nodes;
}

function Dots() {
  return (
    <span className="flex gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
    </span>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
