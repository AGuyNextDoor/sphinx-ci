import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    quiz: {
      count: vi.fn(),
    },
  },
}));

// Mock upstash (not configured)
vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";

describe("rate limiting (DB fallback)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows requests under the limit", async () => {
    vi.mocked(prisma.quiz.count).mockResolvedValue(5);

    const result = await checkRateLimit("spx_test_key", 10, 3600);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it("blocks requests at the limit", async () => {
    vi.mocked(prisma.quiz.count).mockResolvedValue(10);

    const result = await checkRateLimit("spx_test_key", 10, 3600);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("blocks requests over the limit", async () => {
    vi.mocked(prisma.quiz.count).mockResolvedValue(15);

    const result = await checkRateLimit("spx_test_key", 10, 3600);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows first request (count = 0)", async () => {
    vi.mocked(prisma.quiz.count).mockResolvedValue(0);

    const result = await checkRateLimit("spx_test_key", 10, 3600);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });
});
