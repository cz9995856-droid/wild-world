import { readFileSync } from "node:fs";
import path from "node:path";
import { SPECIES } from "../lib/data/species";
import { VIDEOS } from "../lib/data/videos";
import { QUIZ_QUESTIONS } from "../lib/data/quiz";
import { TIMELINE } from "../lib/data/timeline";
import { HOME_SECTIONS } from "../lib/data/sections";
import { SOURCE_REGISTRY } from "../lib/sources/registry";
import { applyEditorial } from "../lib/data/news-editorial";
import type { NewsArticle } from "../lib/types";

const root = process.cwd();
const integration = JSON.parse(readFileSync(path.join(root, "public/data/integration.json"), "utf8"));
const snapshot = JSON.parse(readFileSync(path.join(root, "public/data/news-snapshot.json"), "utf8")) as {
  articles: NewsArticle[];
};

const news = snapshot.articles.map(applyEditorial);

const payload = {
  exported_at: new Date().toISOString(),
  species: SPECIES,
  news,
  media: integration.photos,
  sounds: integration.sounds,
  external: integration.species,
  hero: integration.hero,
  videos: VIDEOS,
  quiz: QUIZ_QUESTIONS,
  timeline: TIMELINE,
  sections: HOME_SECTIONS,
  sources: SOURCE_REGISTRY,
};

process.stdout.write(JSON.stringify(payload));