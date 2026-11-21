"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ExternalLink, RotateCcw, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";
import { correctAnswers, isCorrect, isMultiSelect } from "@/lib/wildchina/quiz-bank";
import { recordAnswer } from "@/lib/wildchina/quiz-storage";

const TYPE_LABEL: Record<string, string> = { single: "单选", multiple: "多选", boolean: "判断" };

export function QuizRunner({
  questions,
  onRestart,
  onExit,
}: {
  questions: QuizQuestion[];
  onRestart?: () => void;
  onExit?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const multi = current ? isMultiSelect(current) : false;
  const correct = current ? correctAnswers(current) : [];
  const answered = current ? results[current.id] : undefined;

  const score = useMemo(() => Object.values(results).filter(Boolean).length, [results]);
  const answeredCount = useMemo(() => Object.keys(results).length, [results]);

  if (!current) {
    return (
      <div className="border border-[var(--line)] bg-[var(--surface)] p-8 text-center text-[12px] text-[var(--muted)]">
        当前题库没有可用题目。
      </div>
    );
  }

  function toggle(option: number) {
    if (submitted) return;
    if (multi) {
      setSelected((prev) => (prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]));
    } else {
      setSelected([option]);
    }
  }

  function submit() {
    if (submitted || selected.length === 0) return;
    const ok = isCorrect(current, selected);
    setSubmitted(true);
    setResults((prev) => ({ ...prev, [current.id]: ok }));
    recordAnswer(current.id, current.topic ?? "species", ok, selected);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setSubmitted(false);
  }

  function prev() {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setSelected([]);
    setSubmitted(false);
  }

  function restart() {
    setIndex(0);
    setSelected([]);
    setSubmitted(false);
    setResults({});
    setFinished(false);
    onRestart?.();
  }

  if (finished) {
    const pct = answeredCount === 0 ? 0 : Math.round((score / answeredCount) * 100);
    return (
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
        <p className="wc-kicker">挑战完成</p>
        <h3 className="display mt-2 text-[30px]">本次成绩 {score} / {answeredCount}</h3>
        <p className="mt-2 text-[12px] text-[var(--muted)]">正确率 {pct}%。记录已保存在本设备。</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={restart} className="btn-primary">
            <RotateCcw size={14} /> 重新挑战
          </button>
          {onExit && (
            <button onClick={onExit} className="btn-outline">
              <ArrowLeft size={14} /> 返回挑战中心
            </button>
          )}
        </div>
      </div>
    );
  }

  const isRight = submitted && answered === true;

  return (
    <div className="border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
          <span className="border border-[var(--line-strong)] px-2 py-0.5">{TYPE_LABEL[current.type ?? "single"]}</span>
          <span>{current.category}</span>
          <span>难度 {current.difficulty}</span>
          {current.verified ? <span>已核验</span> : <span className="text-[var(--clay)]">编辑整理</span>}
        </div>
        <div className="text-[10px] text-[var(--muted)]">
          {index + 1} / {questions.length} · 得分 {score}
        </div>
      </div>

      <div className="h-1 w-full bg-[var(--surface-2)]">
        <div className="h-full bg-[var(--forest)] transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="display text-[21px] leading-snug sm:text-[24px]">{current.question}</h3>
        {multi && <p className="mt-1 text-[10px] text-[var(--muted)]">多选题：请选择所有正确选项后提交。</p>}

        <div className="mt-4 space-y-2">
          {current.options.map((option, i) => {
            const chosen = selected.includes(i);
            const isAnswer = correct.includes(i);
            const showState = submitted;
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                disabled={submitted}
                className={`flex w-full items-start gap-3 border px-3 py-2.5 text-left text-[12.5px] transition-colors ${
                  showState && isAnswer
                    ? "border-[var(--forest)] bg-[var(--forest)]/10"
                    : showState && chosen && !isAnswer
                      ? "border-[var(--clay)] bg-[var(--clay)]/10"
                      : chosen
                        ? "border-[var(--forest)]"
                        : "border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-[var(--line-strong)] text-[9px]">
                  {showState && isAnswer ? <Check size={11} /> : showState && chosen ? <X size={11} /> : String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button onClick={submit} disabled={selected.length === 0} className="btn-primary mt-4 disabled:opacity-40">
            提交答案
          </button>
        ) : (
          <div className="mt-5 border-t border-[var(--line)] pt-4">
            <p className={`flex items-center gap-2 text-[13px] ${isRight ? "text-[var(--forest)]" : "text-[var(--clay)]"}`}>
              {isRight ? <Check size={15} /> : <X size={15} />}
              {isRight ? "回答正确" : "回答错误"}
            </p>
            <p className="mt-2 text-[11.5px] text-[var(--ink-soft)]">
              正确答案：{correct.map((i) => `${String.fromCharCode(65 + i)}. ${current.options[i]}`).join("；")}
            </p>

            <div className="mt-3 border border-[var(--line)] bg-[var(--surface-2)] p-3">
              <p className="text-[10px] tracking-[0.18em] text-[var(--muted)]">科学解析</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--ink-soft)]">{current.explanation}</p>
              {current.option_explains && current.option_explains.length > 0 && (
                <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-[var(--muted)]">
                  {current.option_explains.map((text, i) => (
                    <li key={i}>
                      {String.fromCharCode(65 + i)}. {text}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[10.5px]">
              <a href={current.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                来源：{current.source_name} <ExternalLink size={10} />
              </a>
              {current.updated_at && <span className="text-[var(--muted)]">更新 {current.updated_at}</span>}
              {current.species_slug && (
                <Link href={`/explore/encyclopedia/${current.species_slug}`} className="inline-flex items-center gap-1 underline">
                  查看物种档案 <ArrowRight size={10} />
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
          <button onClick={prev} disabled={index === 0} className="btn-outline disabled:opacity-40">
            <ArrowLeft size={14} /> 上一题
          </button>
          {submitted ? (
            <button onClick={next} className="btn-primary">
              {index + 1 >= questions.length ? "查看成绩" : "下一题"} <ArrowRight size={14} />
            </button>
          ) : (
            <span className="text-[10px] text-[var(--muted)]">提交后可查看解析</span>
          )}
        </div>
      </div>
    </div>
  );
}