import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getLocale, getDictionary } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const locale = await getLocale();
  const t = getDictionary(locale);

  // Get all quizzes for user's teams
  const quizzes = await prisma.quiz.findMany({
    where: { team: { userId: session.user.id } },
    select: {
      id: true,
      repo: true,
      status: true,
      score: true,
      attempts: true,
      createdAt: true,
    },
  });

  if (quizzes.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
          {t.analytics.title}
        </h1>
        <p className="text-sm mb-8" style={{ color: "#b0a8c4" }}>{t.analytics.subtitle}</p>
        <div className="rounded-lg p-8 text-center border" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <p style={{ color: "#b0a8c4" }}>{t.analytics.noData}</p>
        </div>
      </div>
    );
  }

  // Compute stats
  const total = quizzes.length;
  const passed = quizzes.filter((q) => q.status === "PASSED").length;
  const failed = quizzes.filter((q) => q.status === "FAILED").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const scores = quizzes.filter((q) => q.score !== null).map((q) => q.score!);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const totalAttempts = quizzes.reduce((sum, q) => sum + q.attempts, 0);

  // Per-repo stats
  const repoMap = new Map<string, { total: number; passed: number; failed: number; scores: number[] }>();
  for (const q of quizzes) {
    const entry = repoMap.get(q.repo) || { total: 0, passed: 0, failed: 0, scores: [] };
    entry.total++;
    if (q.status === "PASSED") entry.passed++;
    if (q.status === "FAILED") entry.failed++;
    if (q.score !== null) entry.scores.push(q.score);
    repoMap.set(q.repo, entry);
  }

  const repoStats = Array.from(repoMap.entries())
    .map(([repo, stats]) => ({
      repo,
      ...stats,
      rate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0,
      avg: stats.scores.length > 0 ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Last 30 days activity (quizzes per day)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentQuizzes = quizzes.filter((q) => q.createdAt >= thirtyDaysAgo);
  const dayMap = new Map<string, { passed: number; failed: number; pending: number }>();
  for (const q of recentQuizzes) {
    const day = q.createdAt.toISOString().split("T")[0];
    const entry = dayMap.get(day) || { passed: 0, failed: 0, pending: 0 };
    if (q.status === "PASSED") entry.passed++;
    else if (q.status === "FAILED") entry.failed++;
    else entry.pending++;
    dayMap.set(day, entry);
  }

  // Fill in missing days for chart
  const days: { date: string; passed: number; failed: number; pending: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    const entry = dayMap.get(key) || { passed: 0, failed: 0, pending: 0 };
    days.push({ date: key, ...entry });
  }
  const maxPerDay = Math.max(1, ...days.map((d) => d.passed + d.failed + d.pending));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
        {t.analytics.title}
      </h1>
      <p className="text-sm mb-8" style={{ color: "#b0a8c4" }}>{t.analytics.subtitle}</p>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: t.analytics.passRate, value: `${passRate}%`, gold: true },
          { label: t.analytics.avgScore, value: `${avgScore}%`, gold: false },
          { label: t.analytics.totalQuizzes, value: String(total), gold: false },
          { label: t.analytics.totalAttempts, value: String(totalAttempts), gold: false },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <p className="text-xs mb-1" style={{ color: "#8b85a0" }}>{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.gold ? "#c9a84c" : "white", fontFamily: "Georgia, serif" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Activity chart (last 30 days) */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
          {t.analytics.last30}
        </h2>
        <div className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="flex items-end gap-[2px] h-24">
            {days.map((day) => {
              const total = day.passed + day.failed + day.pending;
              const height = total > 0 ? (total / maxPerDay) * 100 : 0;
              const passedH = total > 0 ? (day.passed / total) * height : 0;
              const failedH = total > 0 ? (day.failed / total) * height : 0;
              const pendingH = height - passedH - failedH;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col justify-end rounded-sm overflow-hidden"
                  title={`${day.date}: ${day.passed}✓ ${day.failed}✗ ${day.pending}⏳`}
                  style={{ height: "100%" }}
                >
                  {pendingH > 0 && (
                    <div style={{ height: `${pendingH}%`, background: "rgba(201,168,76,0.2)" }} />
                  )}
                  {failedH > 0 && (
                    <div style={{ height: `${failedH}%`, background: "rgba(239,68,68,0.5)" }} />
                  )}
                  {passedH > 0 && (
                    <div style={{ height: `${passedH}%`, background: "#c9a84c" }} />
                  )}
                  {total === 0 && (
                    <div style={{ height: "2px", background: "#252036" }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: "#8b85a0" }}>
            <span>{days[0]?.date.slice(5)}</span>
            <span>{days[days.length - 1]?.date.slice(5)}</span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "#8b85a0" }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#c9a84c" }} />
              {t.analytics.passed}
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(239,68,68,0.5)" }} />
              {t.analytics.failed}
            </span>
          </div>
        </div>
      </div>

      {/* Per-repo table */}
      <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
        {t.analytics.perRepo}
      </h2>
      <div className="rounded-lg border overflow-x-auto" style={{ background: "#1a1628", borderColor: "#252036" }}>
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b" style={{ borderColor: "#252036" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.analytics.repo}</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.analytics.quizzes}</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.analytics.passed}</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.analytics.failed}</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.analytics.rate}</th>
              <th className="text-right px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.analytics.avg}</th>
            </tr>
          </thead>
          <tbody>
            {repoStats.map((repo) => (
              <tr key={repo.repo} className="border-b" style={{ borderColor: "rgba(37,32,54,0.5)" }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "#b0a8c4" }}>{repo.repo}</td>
                <td className="px-4 py-3 text-right text-white">{repo.total}</td>
                <td className="px-4 py-3 text-right" style={{ color: "#c9a84c" }}>{repo.passed}</td>
                <td className="px-4 py-3 text-right text-red-400">{repo.failed}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      color: repo.rate >= 70 ? "#c9a84c" : "#ef4444",
                      background: repo.rate >= 70 ? "rgba(201,168,76,0.1)" : "rgba(239,68,68,0.1)",
                    }}
                  >
                    {repo.rate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right" style={{ color: "#b0a8c4" }}>{repo.avg}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
