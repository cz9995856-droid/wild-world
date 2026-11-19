import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { MentorChat } from "@/components/mentor/mentor-chat";

export const metadata: Metadata = {
  title: "AI 自然导师",
  description: "基于中国特有脊椎动物馆藏的自然导师问答，回答问题只依据可追溯的馆藏资料。",
};

export default function MentorPage() {
  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">自然导师 · 互动学习</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">问馆</h1>
          <p className="wc-prose mt-3">
            把疑问抛给自然导师：它会先在馆藏中检索，再组织回答。资料不足时会直接说明，不编造物种数据与保护等级。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          馆藏 361 种 · 四大类群
          <br />
          回答依据馆藏检索 · 附来源
        </p>
      </div>
      <MentorChat />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        自然导师用于理解中国特有脊椎动物的形态、生态与保护价值，不提供饲养、投喂或捕捉建议。馆藏内容为编辑整理，未逐条核验原始文献。
      </p>
    </div>
  );
}