"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, RotateCcw, Trophy, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

export function QuizLab({ questions }: { questions: QuizQuestion[] }) {
  const [difficulty, setDifficulty] = useState<"all" | 1 | 2 | 3>("all");
  const pool = useMemo(
    () => (difficulty === "all" ? questions : questions.filter((q) => q.difficulty === difficulty)),
    [questions, difficulty]
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; correct: boolean }>>([]);

  const current = pool[index];

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const correct = i === current.answer_index;
    if (correct) setScore((s) => s + 1);
    setHistory((h) => [...h, { id: current.id, correct }]);
  }

  function next() {
    if (index + 1 >= pool.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setHistory([]);
  }

  function changeDifficulty(value: string) {
    const next = value === "all" ? "all" : (Number(value) as 1 | 2 | 3);
    setDifficulty(next);
    restart();
  }

  if (finished) {
    const pct = Math.round((score / pool.length) * 100);
    return (
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
        <div className="mx-auto max-w-lg text-center">
          <Trophy size={30} className="mx-auto text-[var(--amber)]" />
          <p className="label mt-4 text-[var(--muted)]">Challenge complete</p>
          <p className="display mt-2 text-[48px]">{pct}%</p>
          <p className="mt-1 text-[13px]">
            {score} / {pool.length} 题正确
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--muted)]">
            {pct >= 80
              ? "很好。请记住：科学结论有来源、有年份，也有不确定性。"
              : "继续探索馆藏档案，每一道题的解析都给出参考来源。"}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button onClick={restart} className="btn-primary">
              <RotateCcw size={14} /> 再来一轮
            </button>
            <button onClick={() => changeDifficulty("all")} className="btn-outline">
              全部难度
            </button>
          </div>
          <div className="mt-8 space-y-1.5 text-left">
            {history.map((h, i) => {
              const q = questions.find((x) => x.id === h.id);
              return (
                <div key={h.id} className="flex items-center gap-2 text-[10.5px] text-[var(--muted)]">
                  <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
                  {h.correct ? <Check size={11} className="text-[#2A6B51]" /> : <X size={11} className="text-[var(--clay)]" />}
                  <span className="truncate">{q?.question}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
            <span className="font-mono">{String(index + 1).padStart(2, "0")}</span>
            <span>/ {pool.length}</span>
            <span className="h-3 w-[1px] bg-[var(--line-strong)]" />
            <span>{current.category}</span>
            <span>难度 {"★".repeat(current.difficulty)}</span>
          </div>
          <span className="text-[10px] text-[var(--muted)]">当前得分 {score}</span>
        </div>

        <div className="mt-5 h-[3px] w-full bg-[var(--surface-2)]">
          <div className="h-full bg-[var(--forest)] transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / pool.length) * 100}%` }} />
        </div>

        <h3 className="display mt-6 text-[24px] leading-snug sm:text-[30px]">{current.question}</h3>

        <div className="mt-6 space-y-2">
          {current.options.map((option, i) => {
            const isChosen = selected === i;
            const isCorrect = i === current.answer_index;
            let cls = "border-[var(--line)] hover:border-[var(--line-strong)]";
            if (answered && isCorrect) cls = "border-[#2A6B51] bg-[#2A6B51]/10";
            else if (answered && isChosen && !isCorrect) cls = "border-[var(--clay)] bg-[#A96246]/10";
            else if (answered) cls = "border-[var(--line)] opacity-60";
            return (
              <button
                key={option}
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex w-full items-center gap-3 border px-4 py-3 text-left text-[12.5px] transition-colors ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/30 font-mono text-[10px]">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
                {answered && isCorrect && <Check size={14} className="text-[#2A6B51]" />}
                {answered && isChosen && !isCorrect && <X size={14} className="text-[var(--clay)]" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 border-l-2 border-[var(--amber)] bg-[var(--surface-2)] p-4">
            <p className="text-[11px] font-medium">
              {selected === current.answer_index ? "回答正确" : "再想一想"}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">{current.explanation}</p>
            <a href={current.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[9.5px] underline">
              来源：{current.source_name} ↗
            </a>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-[9.5px] text-[var(--muted)]">
            题目与解析为馆方编辑整理；来源链接逐题标注。
          </span>
          <button onClick={next} disabled={!answered} className="btn-primary disabled:opacity-40">
            {index + 1 >= pool.length ? "查看结果" : "下一题"} <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="label text-[var(--muted)]">Difficulty · 难度</p>
          <div className="mt-2 space-y-1.5">
            {[
              { key: "all", label: "全部难度" },
              { key: "1", label: "入门 ★" },
              { key: "2", label: "进阶 ★★" },
              { key: "3", label: "挑战 ★★★" },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => changeDifficulty(d.key)}
                className={`block w-full border px-3 py-2 text-left text-[11px] ${
                  String(difficulty) === d.key ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]" : "border-[var(--line)]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
          知识挑战用于检验对馆藏内容的阅读，不替代系统学习。答错时会显示解释与来源，允许重新挑战。
        </div>
      </div>
    </div>
  );
}