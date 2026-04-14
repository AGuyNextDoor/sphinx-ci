import { describe, it, expect } from "vitest";
import { scaleQuestionCount } from "@/lib/claude";

function diffOfLines(n: number): string {
  return Array(n).fill("x").join("\n");
}

describe("scaleQuestionCount", () => {
  it("scales down for very small diffs", () => {
    const result = scaleQuestionCount(10, diffOfLines(5), ["a.ts"]);
    expect(result).toBe(5);
  });

  it("scales slightly down for small diffs", () => {
    const result = scaleQuestionCount(10, diffOfLines(60), ["a.ts"]);
    expect(result).toBe(8);
  });

  it("keeps baseline for medium diffs", () => {
    const result = scaleQuestionCount(10, diffOfLines(200), ["a.ts", "b.ts"]);
    expect(result).toBe(10);
  });

  it("scales up for large diffs", () => {
    const result = scaleQuestionCount(10, diffOfLines(400), ["a.ts", "b.ts", "c.ts"]);
    expect(result).toBe(15);
  });

  it("scales up to 2x for very large diffs", () => {
    const result = scaleQuestionCount(10, diffOfLines(900), ["a.ts", "b.ts"]);
    expect(result).toBe(20);
  });

  it("clamps to a minimum of 3 questions", () => {
    const result = scaleQuestionCount(4, diffOfLines(5), ["a.ts"]);
    expect(result).toBe(3);
  });

  it("clamps to a maximum of 20 questions", () => {
    const result = scaleQuestionCount(15, diffOfLines(2000), ["a.ts", "b.ts", "c.ts", "d.ts"]);
    expect(result).toBe(20);
  });

  it("file count contributes to the scope weight", () => {
    const fewFiles = scaleQuestionCount(10, diffOfLines(50), ["a.ts"]);
    const manyFiles = scaleQuestionCount(10, diffOfLines(50), Array(20).fill("f.ts"));
    expect(manyFiles).toBeGreaterThan(fewFiles);
  });

  it("handles empty diff", () => {
    const result = scaleQuestionCount(10, "", []);
    expect(result).toBe(5);
  });

  it("scales relative to the configured baseline", () => {
    const small = scaleQuestionCount(6, diffOfLines(500), ["a.ts"]);
    const large = scaleQuestionCount(12, diffOfLines(500), ["a.ts"]);
    expect(small).toBe(9);
    expect(large).toBe(18);
  });
});
