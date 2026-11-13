"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Bot, ExternalLink, Loader2, RotateCcw, ShieldCheck, Sparkles, User } from "lucide-react";
import { useUI } from "@/components/providers";

interface Source {
  title: string;
  url: string;
  type: "species" | "news";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "local" | "llm";
  model?: string | null;
  sources?: Source[];
  matched?: Array<{ slug: string; name_cn: string; name_en: string }>;
  simulated?: boolean;
}

const SUGGESTIONS = [
  "大熊猫主要吃什么？",
  "雪豹的保护等级和主要威胁是什么？",
  "蓝鲸有多大？",
  "小头鼠海豚为什么濒危？",
  "长颈鹿的脖子有几节颈椎？",
  "帝企鹅如何孵卵？",
];

export function AiChat({ configured, mode }: { configured: boolean; mode: string }) {
  const { locale } = useUI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, locale }),
      });
      const json = (await res.json()) as Omit<Message, "role" | "content"> & { answer?: string; message?: string; error?: string };
      if (!res.ok) throw new Error(json.message || json.error || `HTTP ${res.status}`);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: json.answer ?? "",
          mode: json.mode,
          model: json.model,
          sources: json.sources,
          matched: json.matched,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      window.setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="flex min-h-[560px] flex-col border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <div className="flex items-center gap-2 text-[11px]">
            <Bot size={14} /> WILD WORLD Assistant
          </div>
          <div className="flex items-center gap-2">
            <span className={`chip ${configured ? "border-[#2A6B51]/40 text-[#2A6B51]" : ""}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${configured ? "bg-[#2A6B51]" : "bg-[var(--amber)]"}`} />
              {configured ? "模型已配置" : "本地检索模式"}
            </span>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-[10px] text-[var(--muted)] hover:text-[var(--ink)]"
                aria-label="清空对话"
              >
                <RotateCcw size={12} className="mr-1 inline" /> 清空
              </button>
            )}
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-lg py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--line-strong)]">
                <Sparkles size={20} className="text-[var(--amber)]" />
              </div>
              <h2 className="display mt-5 text-[26px]">问博物馆一个问题</h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                先检索馆藏档案，再组织回答。未收录的内容会明确说明，不编造保护等级与种群数量。
              </p>
              <div className="mt-6 grid gap-2 text-left sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="border border-[var(--line)] px-3 py-2.5 text-[11px] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-[#F5F1E7]">
                    <Bot size={13} />
                  </span>
                )}
                <div className={`min-w-0 max-w-[88%] ${m.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`whitespace-pre-wrap break-words border px-4 py-3 text-[12.5px] leading-relaxed ${
                      m.role === "user"
                        ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                        : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)]"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === "assistant" && (
                    <>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-[var(--muted)]">
                        <span className="chip">{m.mode === "llm" ? `模型：${m.model}` : "本地知识库检索"}</span>
                        {m.matched?.map((s) => (
                          <Link key={s.slug} href={`/encyclopedia/${s.slug}`} className="chip hover:border-[var(--ink)]">
                            {s.name_cn}
                          </Link>
                        ))}
                      </div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 border-t border-[var(--line)] pt-2">
                          <p className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Sources</p>
                          <ul className="mt-1 space-y-1">
                            {m.sources.map((s) => (
                              <li key={s.url}>
                                {s.url.startsWith("/") ? (
                                  <Link href={s.url} className="text-[10px] text-[var(--ink-soft)] underline">
                                    {s.title}
                                  </Link>
                                ) : (
                                  <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[var(--ink-soft)] underline">
                                    {s.title} <ExternalLink size={9} />
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {m.role === "user" && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--line-strong)]">
                    <User size={13} />
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                <Loader2 size={13} className="animate-spin" /> 正在检索馆藏并组织回答…
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="border-t border-[#A96246]/30 bg-[#A96246]/5 px-4 py-2 text-[10.5px] text-[var(--clay)]">
            请求失败：{error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-[var(--line)] p-3"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              maxLength={500}
              placeholder="问一个关于动物的问题…（Enter 发送，Shift+Enter 换行）"
              className="field min-h-[52px] flex-1 resize-none py-2.5"
              aria-label="输入问题"
            />
            <button
              type="submit"
              disabled={loading || input.trim().length < 2}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center bg-[var(--forest)] text-[#F5F1E7] disabled:opacity-40"
              aria-label="发送问题"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
          <p className="mt-2 text-[9px] text-[var(--muted)]">
            当前模式：{mode} · 不以模型替代来源；保护等级以 IUCN 官方评估为准。
          </p>
        </form>
      </div>

      <aside className="space-y-3">
        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4">
          <p className="flex items-center gap-1.5 text-[10.5px] font-medium">
            <ShieldCheck size={13} className="text-[#2A6B51]" /> 回答边界
          </p>
          <ul className="mt-2 space-y-2 text-[10px] leading-relaxed text-[var(--muted)]">
            <li>优先检索馆藏；未收录时明确说明，不调用外部猜测。</li>
            <li>保护等级与种群数量必须带来源与评估年份。</li>
            <li>不提供投喂、捕捉或饲养野生动物的操作建议。</li>
            <li>不声称访问了实时互联网。</li>
          </ul>
        </div>
        <div className="border border-[var(--line)] p-4">
          <p className="label text-[var(--muted)]">Configuration</p>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
            {configured
              ? "已配置服务端语言模型。密钥只在服务端读取，不会发送到浏览器。"
              : "未配置 AI_API_KEY。当前使用本地知识库检索模式，答案只由馆藏字段组织，不伪造模型输出。"}
          </p>
          <Link href="/sources" className="mt-2 inline-block text-[10px] underline">环境变量与数据源说明 →</Link>
        </div>
        <div className="border border-[var(--line)] p-4">
          <p className="label text-[var(--muted)]">Privacy</p>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
            本站不保存对话内容。若配置了模型服务，问题与检索片段会发送给该服务商；未配置时请求不离开本站服务器。
          </p>
        </div>
      </aside>
    </div>
  );
}