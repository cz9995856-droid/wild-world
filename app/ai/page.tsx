import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { AiChat } from "@/components/ai/ai-chat";
import { isLlmConfigured } from "@/lib/ai/answer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI 动物问答",
  description: "先检索馆藏知识库，再由 AI 组织回答；支持中英文，未知信息明确说明。",
};

export default function AiPage() {
  const configured = isLlmConfigured();
  return (
    <>
      <PageHeader
        kicker="AI Q&A · 动物问答"
        title="一个有出处的回答，比一个流畅的答案更重要"
        description="助理先检索馆藏物种档案与新闻来源，再组织回答。未配置模型时使用本地检索模式；任何时候都不编造科学数据、保护等级或种群数量。"
        breadcrumbs={[{ label: "AI 动物问答" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{configured ? "LLM 已配置" : "本地检索模式"}</span>
            <span className="chip">中文 / English</span>
            <span className="chip">服务端 API</span>
          </div>
        }
      />
      <div className="container-museum pb-20 pt-8">
        <AiChat configured={configured} mode={configured ? "LLM + 馆藏检索" : "本地馆藏检索（未调用模型）"} />
      </div>
    </>
  );
}