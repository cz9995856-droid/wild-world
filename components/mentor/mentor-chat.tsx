"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Send, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "local" | "llm";
  sources?: Array<{ title: string; url: string; type: string }>;
  matched?: Array<{ slug: string; name_cn: string; name_en: string }>;
  disclaimer?: string;
}

const QUICK = [
  "大熊猫为什么被归为食肉目？",
  "中国特有动物是怎么判定的？",
  "扬子鳄和普通鳄鱼有什么区别？",
  "金丝猴为什么叫仰鼻猴？",
  "高原鼠兔为什么被称为关键种？",
];

export function MentorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setError(null);
    setInput("");
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const history = nextMessages.slice(-5, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history, locale: "zh" }),
      });
      const data = (await res.json()) as {
        answer?: string;
        mode?: "local" | "llm";
        sources?: Message["sources"];
        matched_species?: Message["matched"];
        disclaimer?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.answer) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer as string,
          mode: data.mode,
          sources: data.sources,
          matched: data.matched_species,
          disclaimer: data.disclaimer,
        },
      ]);
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <p className="flex items-center gap-2 text-[12px]">
            <Sparkles size={14} className="text-[var(--forest)]" /> 馆藏问答
          </p>
          <p className="text-[9.5px] text-[var(--muted)]">
            {messages.length ? `${messages.filter((m) => m.role === "assistant").length} 次回答` : "由馆藏检索驱动"}
          </p>
        </div>

        <div ref={listRef} className="max-h-[52svh] min-h-[320px] space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">
                我是这座数字馆的自然导师。你可以问我中国特有脊椎动物的分类、形态、生态与保护问题。
              </p>
              <p className="text-[10.5px] leading-relaxed text-[var(--muted)]">
                回答只依据馆藏资料；资料不足时会直接说明，不会编造数字或来源。
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <div key={i} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  message.role === "user"
                    ? "max-w-[86%] bg-[var(--forest)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#F5F1E7]"
                    : "max-w-[92%] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3 text-[12.5px] leading-relaxed text-[var(--ink-soft)]"
                }
              >
                <p className="whitespace-pre-line">{message.content}</p>

                {message.role === "assistant" && message.matched && message.matched.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {message.matched.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/explore/encyclopedia/${item.slug}`}
                        className="inline-flex items-center gap-1 border border-[var(--line-strong)] px-2 py-1 text-[9.5px] hover:border-[var(--forest)]"
                      >
                        {item.name_cn} <ArrowRight size={9} />
                      </Link>
                    ))}
                  </div>
                )}

                {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                  <details className="mt-2 border-t border-[var(--line)] pt-2">
                    <summary className="cursor-pointer text-[9.5px] text-[var(--muted)]">来源（{message.sources.length}）</summary>
                    <ul className="mt-1.5 space-y-1 text-[9.5px] text-[var(--muted)]">
                      {message.sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer" className="underline">
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {message.role === "assistant" && (
                  <p className="mt-2 text-[9px] text-[var(--muted)]">
                    {message.mode === "llm" ? "语言模型整理 · 馆藏检索" : "本地馆藏检索"}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <Loader2 size={13} className="animate-spin" /> 正在检索馆藏并组织回答…
            </div>
          )}

          {error && (
            <p className="border border-[var(--clay)]/40 bg-[var(--clay)]/5 px-3 py-2 text-[11px] text-[var(--clay)]">
              提问失败：{error}
            </p>
          )}
        </div>

        <form
          className="flex items-center gap-2 border-t border-[var(--line)] px-3 py-2.5"
          onSubmit={(event) => {
            event.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="问一个关于中国特有动物的问题…"
            className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[12px] outline-none focus:border-[var(--forest)]"
            maxLength={500}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || input.trim().length < 2}
            className="btn-primary min-h-9 shrink-0 px-4 py-2 text-[11px] disabled:opacity-40"
          >
            <Send size={13} /> 提问
          </button>
        </form>
      </div>

      <aside className="space-y-3">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="wc-field-label">试试这些问题</p>
          <div className="mt-3 space-y-1.5">
            {QUICK.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => ask(question)}
                disabled={loading}
                className="block w-full border border-[var(--line)] px-2.5 py-2 text-left text-[10.5px] leading-snug transition-colors hover:border-[var(--forest)] disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[9.5px] leading-relaxed text-[var(--muted)]">
          <p className="text-[var(--ink-soft)]">使用说明</p>
          <p className="mt-2">
            回答基于馆藏中国特有脊椎动物档案检索。问题不会写入数据库；仅在你发起提问时，问题与检索到的馆藏片段会发送给语言模型服务。
          </p>
          <p className="mt-2">不提供饲养、投喂或捕捉野生动物的建议。</p>
        </div>
      </aside>
    </div>
  );
}