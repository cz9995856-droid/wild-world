"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, Compass, Leaf, RotateCcw, Shield, Sparkles, Trophy } from "lucide-react";
import type { QuizQuestion, QuizTopic } from "@/lib/types";
import { QUIZ_BANK, QUIZ_BY_ID, QUIZ_TOPICS, questionsByDifficulty, questionsByTopic, topicCounts } from "@/lib/wildchina/quiz-bank";
import {
  computeStats,
  explorerLevel,
  loadQuizStore,
  resetQuizStore,
  topicProgress,
  type QuizStore,
} from "@/lib/wildchina/quiz-storage";
import { shanghaiDateKey } from "@/lib/wildchina/daily";
import { QuizRunner } from "@/components/quiz/quiz-runner";

const TOPIC_ICONS: Record<QuizTopic, typeof BookOpen> = {
  species: BookOpen,
  ecology: Leaf,
  conservation: Shield,
  science: Compass,
  review: RotateCcw,
};

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dailyQuestions(dateKey: string): QuizQuestion[] {
  const rnd = mulberry32(hashSeed(dateKey));
  const pool = [...QUIZ_BANK];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 10);
}

export interface SpeciesChallenge {
  slug: string;
  nameCn: string;
  scientificName: string;
  englishName: string;
  groupLabel: string;
  distribution: string;
  provinces: string[];
  conservation: { status: string; label: string; year: number | null; note: string };
}

export function ChallengeCenter({
  species,
  speciesQuestions = [],
  bankCount = 0,
}: {
  species?: SpeciesChallenge | null;
  speciesQuestions?: QuizQuestion[];
  bankCount?: number;
}) {
  const [store, setStore] = useState<QuizStore>({ version: 1, records: [] });
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState<{ title: string; subtitle: string; questions: QuizQuestion[] } | null>(null);

  useEffect(() => {
    setStore(loadQuizStore());
    setMounted(true);
  }, []);

  const stats = useMemo(() => computeStats(store), [store]);
  const level = useMemo(() => explorerLevel(store), [store]);
  const counts = useMemo(() => topicCounts(), []);
  const dateKey = useMemo(() => shanghaiDateKey(), []);
  const daily = useMemo(() => dailyQuestions(dateKey), [dateKey]);

  const wrongQuestions = useMemo(
    () => stats.wrongIds.map((id) => QUIZ_BY_ID.get(id)).filter((q): q is QuizQuestion => Boolean(q)),
    [stats.wrongIds]
  );

  function start(title: string, subtitle: string, questions: QuizQuestion[]) {
    if (questions.length === 0) return;
    setRun({ title, subtitle, questions });
  }

  if (run) {
    return (
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="wc-kicker">{run.subtitle}</p>
            <h2 className="display mt-1 text-[26px] sm:text-[32px]">{run.title}</h2>
          </div>
          <button onClick={() => setRun(null)} className="btn-outline">
            <RotateCcw size={13} /> 返回挑战中心
          </button>
        </div>
        <QuizRunner questions={run.questions} onExit={() => setRun(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {species && (
        <section className="border border-[var(--forest)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="wc-kicker">Species Challenge · 物种专属挑战</p>
              <h2 className="display mt-2 text-[26px]">{species.nameCn}的专属挑战</h2>
              <p className="mt-1 font-serif text-[12px] italic text-[var(--muted)]">
                {species.scientificName} · {species.englishName}
              </p>
              <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-[var(--ink-soft)]">{species.distribution}</p>
              <p className="mt-2 text-[10px] text-[var(--muted)]">
                共 {speciesQuestions.length} 题：馆藏精编题 {bankCount} 道 + 物种卡速测 {Math.max(0, speciesQuestions.length - bankCount)} 道。
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <button
                onClick={() => start(`${species.nameCn}专属挑战`, "Species Challenge", speciesQuestions)}
                disabled={speciesQuestions.length === 0}
                className="hb-btn text-[12px] disabled:opacity-40"
              >
                开始挑战 <ArrowRight size={14} />
              </button>
              <Link href={`/explore/encyclopedia/${species.slug}`} className="text-[11px] underline">
                返回{species.nameCn}物种卡
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="wc-kicker">Explorer Profile · 探索者档案</p>
            <h2 className="display mt-2 text-[26px]">
              {level.title} · Lv.{level.level}
            </h2>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              经验 {level.xp} / 下一等级 {level.nextXp}。答题记录仅保存在**当前设备**，清除浏览器数据即丢失。
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="display text-[26px]">{mounted ? stats.answered : "—"}</p>
              <p className="text-[9.5px] text-[var(--muted)]">已答题数</p>
            </div>
            <div>
              <p className="display text-[26px]">{mounted ? `${Math.round(stats.accuracy * 100)}%` : "—"}</p>
              <p className="text-[9.5px] text-[var(--muted)]">正确率</p>
            </div>
            <div>
              <p className="display text-[26px]">{mounted ? wrongQuestions.length : "—"}</p>
              <p className="text-[9.5px] text-[var(--muted)]">错题</p>
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full bg-[var(--surface-2)]">
          <div
            className="h-full bg-[var(--forest)] transition-all"
            style={{ width: `${Math.min(100, (level.xp / level.nextXp) * 100)}%` }}
          />
        </div>
        {mounted && stats.answered > 0 && (
          <button
            onClick={() => {
              resetQuizStore();
              setStore({ version: 1, records: [] });
            }}
            className="mt-3 text-[10px] text-[var(--muted)] underline"
          >
            清除本机答题记录
          </button>
        )}
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="wc-kicker">Daily Challenge</p>
            <h2 className="display mt-1 text-[26px]">每日挑战</h2>
          </div>
          <span className="text-[10px] text-[var(--muted)]">{dateKey} · 每天 10 题</span>
        </div>
        <div className="mt-4 border border-[var(--forest)] bg-[var(--forest)] p-5 text-[#F5F1E7] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[13px]">
                <CalendarDays size={15} /> 今日 10 道综合题
              </p>
              <p className="mt-1 text-[11px] text-white/70">覆盖物种探索、生态密码、保护行动与科学发现。</p>
            </div>
            <button
              onClick={() => start("每日挑战", "Daily Challenge", daily)}
              className="border border-[#F5F1E7] px-4 py-2 text-[11px] hover:bg-white/10"
            >
              开始挑战
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="wc-kicker">Practice Modes</p>
            <h2 className="display mt-1 text-[26px]">答题模式</h2>
          </div>
          <span className="text-[10px] text-[var(--muted)]">按难度循序渐进</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              { label: "入门", difficulty: 1 as const, note: "基础识别与常见特征" },
              { label: "中级", difficulty: 2 as const, note: "生态关系与保护判断" },
              { label: "高级", difficulty: 3 as const, note: "研究方法与复杂推理" },
            ]
          ).map((mode) => {
            const list = questionsByDifficulty(mode.difficulty);
            return (
              <button
                key={mode.label}
                onClick={() => start(`${mode.label}挑战`, "Practice Mode", list)}
                disabled={list.length === 0}
                className="border border-[var(--line)] bg-[var(--surface)] p-4 text-left transition-colors hover:border-[var(--line-strong)] disabled:opacity-40"
              >
                <p className="text-[14px]">{mode.label}</p>
                <p className="mt-1 text-[10px] text-[var(--muted)]">{mode.note}</p>
                <p className="mt-3 text-[9.5px] text-[var(--muted)]">{list.length} 道题</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="wc-kicker">Question Banks</p>
            <h2 className="display mt-1 text-[26px]">五大题库</h2>
          </div>
          <span className="text-[10px] text-[var(--muted)]">共 {QUIZ_BANK.length} 道题</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {QUIZ_TOPICS.map((topic) => {
            const Icon = TOPIC_ICONS[topic.key];
            const total = counts[topic.key];
            const progress = mounted ? topicProgress(store, topic.key, total) : { done: 0, total, accuracy: 0 };
            const isReview = topic.key === "review";
            const questions = isReview ? wrongQuestions : questionsByTopic(topic.key);
            return (
              <div key={topic.key} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <Icon size={16} className="mt-0.5 text-[var(--forest)]" />
                    <div>
                      <p className="text-[13px]">{topic.label}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--muted)]">{topic.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--muted)]">{isReview ? `${wrongQuestions.length} 题` : `${total} 题`}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[9.5px] text-[var(--muted)]">
                    {isReview
                      ? "答错后自动收集，答对即移出"
                      : `进度 ${progress.done}/${total} · 正确率 ${Math.round(progress.accuracy * 100)}%`}
                  </p>
                  <button
                    onClick={() => start(topic.label, isReview ? "Review" : "Challenge", questions)}
                    disabled={questions.length === 0}
                    className="border border-[var(--line-strong)] px-3 py-1.5 text-[10.5px] disabled:opacity-40"
                  >
                    {isReview ? "重做错题" : "开始"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
        <p className="flex items-center gap-1.5 text-[var(--ink-soft)]">
          <Trophy size={12} /> 科学说明
        </p>
        <p className="mt-2">
          题目与解析由馆方编辑整理，标注来源与更新时间；标注“编辑整理”的题目尚未经过外部专家复核，不应视为权威科学结论。
          所有统计数据均由本机真实答题记录计算，不使用虚构数据。
        </p>
        <p className="mt-1 flex items-center gap-1.5">
          <Sparkles size={11} /> 目标：理解中国特有脊椎动物的生命特征、生态关系与保护价值，而不只是记住答案。
        </p>
      </section>
    </div>
  );
}