import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

interface QuizConfig {
  numQuestions?: number;
  passingScore?: number;
  maxAttempts?: number;
  language?: string;
  keyword?: string;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const locale = await getLocale();
  const t = getDictionary(locale);

  const teams = await prisma.team.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { quizzes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const quizStats = await prisma.quiz.groupBy({
    by: ["status"],
    where: { team: { userId: session.user.id } },
    _count: true,
  });

  const totalQuizzes = quizStats.reduce((sum, s) => sum + s._count, 0);
  const passedQuizzes =
    quizStats.find((s) => s.status === "PASSED")?._count || 0;
  const passRate =
    totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t.dashboard.title}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard.statRepos}</p>
              <p className="text-2xl font-bold text-white">{teams.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard.statQuizzes}</p>
              <p className="text-2xl font-bold text-white">{totalQuizzes}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">{t.dashboard.statRate}</p>
              <p className="text-2xl font-bold" style={{ color: "#c9a84c" }}>{passRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t.dashboard.yourRepos}</h2>
          <Link
            href="/dashboard/repos"
            className="text-sm px-4 py-2 font-medium rounded-lg transition-all"
            style={{ background: "#c9a84c", color: "#0f0c1a" }}
          >
            {t.dashboard.configureRepo}
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="rounded-lg p-6 text-center border" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <p className="text-gray-400 mb-3">
              {t.dashboard.noRepo}
            </p>
            <Link
              href="/dashboard/repos"
              className="text-sm"
              style={{ color: "#c9a84c" }}
            >
              {t.dashboard.seeRepos}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => {
              const config = (team.quizConfig || {}) as QuizConfig;
              return (
                <div
                  key={team.id}
                  className="rounded-lg p-4 border"
                  style={{ background: "#1a1628", borderColor: "#252036" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{team.name}</p>
                      <p className="text-sm text-gray-400 font-mono">
                        {team.apiKey.slice(0, 12)}...{team.apiKey.slice(-6)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-400">
                      {team._count.quizzes} quiz
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {config.numQuestions || 10} {t.dashboard.questions}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {t.dashboard.scoreMin} {config.passingScore || 70}%
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {config.maxAttempts || 3} {t.dashboard.attempts}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {config.language === "en" ? "EN" : "FR"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {config.keyword || "/sphinx"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
