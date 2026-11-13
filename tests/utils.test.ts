import { describe, expect, it } from "vitest";
import { formatDate, formatWeight, formatRange, hashString, truncate, CONSERVATION_META } from "@/lib/utils";

describe("formatting utilities", () => {
  it("formats dates and flags invalid ones", () => {
    expect(formatDate("2026-11-13")).toBe("2026/11/13");
    expect(formatDate("not-a-date")).toBe("日期待核验");
  });

  it("formats weights in kg and tonnes", () => {
    expect(formatWeight(70, 125)).toBe("70 公斤 – 125 公斤");
    expect(formatWeight(50000, 150000)).toBe("50 吨 – 150 吨");
    expect(formatWeight(0.06, 0.3)).toBe("60–300 克");
  });

  it("handles missing ranges without inventing values", () => {
    expect(formatRange(null, "厘米")).toBe("资料待补充");
    expect(formatRange([1, 1], "年")).toBe("1 年");
  });

  it("hashes deterministically", () => {
    expect(hashString("2026-11-13")).toBe(hashString("2026-11-13"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });

  it("truncates long text", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcde…");
    expect(truncate("abc", 5)).toBe("abc");
  });

  it("maps every IUCN code to a visible label", () => {
    for (const code of ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD", "NE"]) {
      expect(CONSERVATION_META[code as keyof typeof CONSERVATION_META].label.length).toBeGreaterThan(0);
    }
  });
});