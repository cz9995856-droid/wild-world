import type { QuizTopic } from "@/lib/types";

export interface QuizAnswerRecord {
  id: string;
  topic: QuizTopic;
  correct: boolean;
  selected: number[];
  at: string;
}

export interface QuizStore {
  version: 1;
  records: QuizAnswerRecord[];
}

const KEY = "wildchina.quiz.v1";
const MAX_RECORDS = 5000;

export function loadQuizStore(): QuizStore {
  if (typeof window === "undefined") return { version: 1, records: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { version: 1, records: [] };
    const parsed = JSON.parse(raw) as Partial<QuizStore>;
    return { version: 1, records: Array.isArray(parsed.records) ? parsed.records : [] };
  } catch {
    return { version: 1, records: [] };
  }
}

function persist(store: QuizStore) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // 存储不可用时静默失败
  }
}

export function recordAnswer(id: string, topic: QuizTopic, correct: boolean, selected: number[]): QuizStore {
  const store = loadQuizStore();
  store.records.push({ id, topic, correct, selected, at: new Date().toISOString() });
  if (store.records.length > MAX_RECORDS) store.records = store.records.slice(-MAX_RECORDS);
  persist(store);
  return store;
}

export function resetQuizStore(): QuizStore {
  const empty: QuizStore = { version: 1, records: [] };
  if (typeof window !== "undefined") persist(empty);
  return empty;
}

export interface QuizStats {
  answered: number;
  correct: number;
  accuracy: number;
  byTopic: Record<QuizTopic, { answered: number; correct: number }>;
  wrongIds: string[];
  answeredIds: string[];
}

export function computeStats(store: QuizStore): QuizStats {
  const byTopic: QuizStats["byTopic"] = {
    species: { answered: 0, correct: 0 },
    ecology: { answered: 0, correct: 0 },
    conservation: { answered: 0, correct: 0 },
    science: { answered: 0, correct: 0 },
    review: { answered: 0, correct: 0 },
  };
  const lastByQuestion = new Map<string, QuizAnswerRecord>();

  for (const r of store.records) {
    byTopic[r.topic] = byTopic[r.topic] ?? { answered: 0, correct: 0 };
    byTopic[r.topic].answered += 1;
    if (r.correct) byTopic[r.topic].correct += 1;
    lastByQuestion.set(r.id, r);
  }

  const correct = store.records.filter((r) => r.correct).length;
  const answered = store.records.length;
  const wrongIds = [...lastByQuestion.values()].filter((r) => !r.correct).map((r) => r.id);
  const answeredIds = [...new Set(store.records.map((r) => r.id))];

  return {
    answered,
    correct,
    accuracy: answered === 0 ? 0 : correct / answered,
    byTopic,
    wrongIds,
    answeredIds,
  };
}

const LEVEL_TITLES = [
  "自然观察实习生",
  "物种记录员",
  "生态观察者",
  "野外调查员",
  "博物学徒",
  "物种专家",
  "生态学者",
  "保护行动者",
  "首席博物学家",
];

export function explorerLevel(store: QuizStore): { xp: number; level: number; title: string; nextXp: number } {
  const stats = computeStats(store);
  const xp = stats.correct * 10 + (stats.answered - stats.correct) * 2;
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const nextXp = 40 * level * level;
  return {
    xp,
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    nextXp,
  };
}

export function topicProgress(store: QuizStore, topic: QuizTopic, total: number): { done: number; total: number; accuracy: number } {
  const stats = computeStats(store);
  const ids = new Set(store.records.filter((r) => r.topic === topic).map((r) => r.id));
  const t = stats.byTopic[topic] ?? { answered: 0, correct: 0 };
  return {
    done: Math.min(ids.size, total),
    total,
    accuracy: t.answered === 0 ? 0 : t.correct / t.answered,
  };
}