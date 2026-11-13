import { describe, expect, it } from "vitest";
import { detectIntents, localAnswer, retrieveSpecies } from "@/lib/ai/knowledge";
import { SPECIES } from "@/lib/data/species";

describe("AI knowledge retrieval", () => {
  it("detects dietary intent", () => {
    expect(detectIntents("大熊猫吃什么？")).toContain("diet");
    expect(detectIntents("雪豹的保护等级是什么")).toContain("conservation");
  });

  it("retrieves the matching species", () => {
    const matches = retrieveSpecies("大熊猫吃什么？", SPECIES);
    expect(matches[0]?.species.slug).toBe("giant-panda");
    expect(matches[0]?.reasons.length).toBeGreaterThan(0);
  });

  it("does not retrieve anything for an unknown topic", () => {
    expect(retrieveSpecies("量子色动力学的渐近自由", SPECIES)).toEqual([]);
  });

  it("answers locally with a source and a mode disclaimer", () => {
    const matches = retrieveSpecies("雪豹的保护等级", SPECIES);
    const answer = localAnswer("雪豹的保护等级", matches, [], detectIntents("雪豹的保护等级"));
    expect(answer).toContain("雪豹");
    expect(answer).toContain("易危");
    expect(answer).toContain("IUCN");
    expect(answer).toContain("本地知识库检索模式");
  });

  it("admits when the collection does not cover the question", () => {
    const answer = localAnswer("独角兽的迁徙路线", [], [], []);
    expect(answer).toContain("暂未收录");
    expect(answer).toContain("不会编造");
  });
});