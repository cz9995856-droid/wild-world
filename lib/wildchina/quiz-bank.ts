import type { QuizQuestion, QuizTopic } from "@/lib/types";
import { QUIZ_QUESTIONS } from "@/lib/data/quiz";
import { QUIZ_SPECIES } from "@/lib/data/quiz-species";
import { QUIZ_ECOLOGY } from "@/lib/data/quiz-ecology";
import { QUIZ_CONSERVATION } from "@/lib/data/quiz-conservation";
import { QUIZ_SCIENCE } from "@/lib/data/quiz-science";

export const QUIZ_TOPICS: Array<{ key: QuizTopic; label: string; description: string }> = [
  { key: "species", label: "物种探索", description: "分类、形态、习性与生理特征" },
  { key: "ecology", label: "生态密码", description: "栖息地、食物链与生态关系" },
  { key: "conservation", label: "保护行动", description: "濒危等级、生存威胁与保护措施" },
  { key: "science", label: "科学发现", description: "分布、观测记录与科学研究方法" },
  { key: "review", label: "错题本", description: "自动收集答错的题目，支持重做" },
];

const TOPIC_BY_CATEGORY: Record<string, QuizTopic> = {
  解剖: "species",
  两栖动物: "species",
  哺乳动物: "species",
  鸟类: "species",
  爬行动物: "species",
  食性: "ecology",
  数据素养: "science",
  保护: "conservation",
  科学: "science",
};

function normalize(q: QuizQuestion): QuizQuestion {
  const topic = q.topic ?? TOPIC_BY_CATEGORY[q.category] ?? "species";
  return {
    ...q,
    type: q.type ?? "single",
    topic,
    answer: q.answer ?? [q.answer_index],
    updated_at: q.updated_at ?? "2026-11-15",
    verified: q.verified ?? false,
  };
}

export const QUIZ_BANK: QuizQuestion[] = [
  ...QUIZ_QUESTIONS.map(normalize),
  ...QUIZ_SPECIES,
  ...QUIZ_ECOLOGY,
  ...QUIZ_CONSERVATION,
  ...QUIZ_SCIENCE,
];

export const QUIZ_BY_ID = new Map(QUIZ_BANK.map((q) => [q.id, q]));

export function questionsByTopic(topic: QuizTopic): QuizQuestion[] {
  return QUIZ_BANK.filter((q) => q.topic === topic);
}

export function questionsByDifficulty(difficulty: 1 | 2 | 3, topic?: QuizTopic): QuizQuestion[] {
  return QUIZ_BANK.filter((q) => q.difficulty === difficulty && (!topic || q.topic === topic));
}

export function topicCounts(): Record<QuizTopic, number> {
  const counts = { species: 0, ecology: 0, conservation: 0, science: 0, review: 0 };
  for (const q of QUIZ_BANK) counts[q.topic ?? "species"] += 1;
  return counts;
}

export function isMultiSelect(q: QuizQuestion): boolean {
  return q.type === "multiple" || (q.answer?.length ?? 1) > 1;
}

export function correctAnswers(q: QuizQuestion): number[] {
  return q.answer ?? [q.answer_index];
}

export function isCorrect(q: QuizQuestion, selected: number[]): boolean {
  const correct = [...correctAnswers(q)].sort((a, b) => a - b);
  const chosen = [...selected].sort((a, b) => a - b);
  return correct.length === chosen.length && correct.every((v, i) => v === chosen[i]);
}