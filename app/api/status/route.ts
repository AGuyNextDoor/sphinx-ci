import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export type ComponentStatus = "operational" | "degraded" | "down" | "unknown";

export type StatusComponent = {
  id: string;
  name: string;
  status: ComponentStatus;
  responseTimeMs: number | null;
  detail?: string;
};

export type StatusResponse = {
  overall: ComponentStatus;
  components: StatusComponent[];
  checkedAt: string;
};

async function checkDb(): Promise<StatusComponent> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      id: "database",
      name: "Database",
      status: "operational",
      responseTimeMs: Date.now() - start,
    };
  } catch (err) {
    return {
      id: "database",
      name: "Database",
      status: "down",
      responseTimeMs: null,
      detail: err instanceof Error ? err.message : "unknown error",
    };
  }
}

async function checkStatusPage(
  id: string,
  name: string,
  url: string,
): Promise<StatusComponent> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        id,
        name,
        status: "unknown",
        responseTimeMs: Date.now() - start,
        detail: `HTTP ${res.status}`,
      };
    }
    const data = (await res.json()) as {
      status?: { indicator?: string; description?: string };
    };
    const indicator = data.status?.indicator;
    let status: ComponentStatus = "unknown";
    if (indicator === "none") status = "operational";
    else if (indicator === "minor" || indicator === "maintenance") status = "degraded";
    else if (indicator === "major" || indicator === "critical") status = "down";
    return {
      id,
      name,
      status,
      responseTimeMs: Date.now() - start,
      detail: data.status?.description,
    };
  } catch (err) {
    return {
      id,
      name,
      status: "unknown",
      responseTimeMs: null,
      detail: err instanceof Error ? err.message : "unknown error",
    };
  }
}

export async function GET() {
  const [db, anthropic, github] = await Promise.all([
    checkDb(),
    checkStatusPage(
      "anthropic",
      "Anthropic API",
      "https://status.anthropic.com/api/v2/status.json",
    ),
    checkStatusPage(
      "github",
      "GitHub API",
      "https://www.githubstatus.com/api/v2/status.json",
    ),
  ]);

  const hub: StatusComponent = {
    id: "hub",
    name: "Hub (sphinx-ci.dev)",
    status: "operational",
    responseTimeMs: 0,
  };

  const components: StatusComponent[] = [hub, db, anthropic, github];

  const hasDown = components.some((c) => c.status === "down");
  const hasDegraded = components.some((c) => c.status === "degraded");
  const allOk = components.every((c) => c.status === "operational");

  const overall: ComponentStatus = hasDown
    ? "down"
    : hasDegraded
      ? "degraded"
      : allOk
        ? "operational"
        : "unknown";

  const body: StatusResponse = {
    overall,
    components,
    checkedAt: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
