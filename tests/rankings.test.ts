import { describe, expect, it } from "vitest";
import { buildRankings, extremeSpecies } from "@/lib/rankings";
import { SPECIES } from "@/lib/data/species";

describe("rankings", () => {
  const boards = buildRankings(SPECIES);

  it("builds all five boards", () => {
    expect(boards.map((b) => b.id)).toEqual(["weight", "length", "lifespan", "speed", "endangered"]);
  });

  it("sorts weight descending and excludes missing values", () => {
    const weight = boards.find((b) => b.id === "weight")!;
    expect(weight.entries[0].species.slug).toBe("blue-whale");
    for (let i = 1; i < weight.entries.length; i += 1) {
      expect(weight.entries[i - 1].value).toBeGreaterThanOrEqual(weight.entries[i].value);
    }
    expect(weight.entries.every((e) => Number.isFinite(e.value))).toBe(true);
  });

  it("places the peregrine falcon first on speed with its caveat", () => {
    const speed = boards.find((b) => b.id === "speed")!;
    expect(speed.entries[0].species.slug).toBe("peregrine-falcon");
    expect(speed.caveat).toContain("俯冲");
  });

  it("puts critically endangered species first without inventing population numbers", () => {
    const endangered = boards.find((b) => b.id === "endangered")!;
    expect(endangered.entries[0].species.conservation.status).toBe("CR");
    expect(endangered.caveat).toContain("评估年份");
  });

  it("exposes extreme species helpers", () => {
    expect(extremeSpecies(SPECIES, "weight")?.slug).toBe("blue-whale");
    expect(extremeSpecies(SPECIES, "lifespan")?.slug).toBe("galapagos-tortoise");
  });
});