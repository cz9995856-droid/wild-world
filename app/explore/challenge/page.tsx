import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { ChallengeCenter } from "@/components/quiz/challenge-center";
import { QUIZ_BANK } from "@/lib/wildchina/quiz-bank";
import { speciesCardQuestions, speciesCardSummary } from "@/lib/wildchina/quiz-species-card";

export const metadata: Metadata = {
  title: "生命探索挑战中心",
  description: "物种探索、生态密码、保护行动与科学发现四大题库，配合错题本与本地学习记录。",
};

export default async function ChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string }>;
}) {
  const params = await searchParams;
  const slug = params.species;
  const species = slug ? speciesCardSummary(slug) : null;
  const bankCount = slug ? QUIZ_BANK.filter((question) => question.species_slug === slug).length : 0;
  const speciesQuestions = slug
    ? [...QUIZ_BANK.filter((question) => question.species_slug === slug), ...speciesCardQuestions(slug)]
    : [];

  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">Life Challenge Center</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">生命探索挑战中心</h1>
          <p className="wc-prose mt-3">
            边答题边认识动物：看看它们的身体、住所以及为什么需要保护。四大专题题库、每日挑战与错题本，
            答题记录仅保存在当前设备。
          </p>
        </div>
      </div>
      <ChallengeCenter species={species} speciesQuestions={speciesQuestions} bankCount={bankCount} />
    </div>
  );
}