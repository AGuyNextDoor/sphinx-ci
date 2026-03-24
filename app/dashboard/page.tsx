import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Cles API</p>
          <p className="text-2xl font-bold text-white">{teams.length}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Quiz total</p>
          <p className="text-2xl font-bold text-white">{totalQuizzes}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Taux de reussite</p>
          <p className="text-2xl font-bold text-green-400">{passRate}%</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Tes cles API</h2>
          <Link
            href="/dashboard/repos"
            className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + Configurer un repo
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-3">
              Aucune cle API. Configure ton premier repo pour commencer.
            </p>
            <Link
              href="/dashboard/repos"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Voir tes repos →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{team.name}</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {team.apiKey.slice(0, 12)}...{team.apiKey.slice(-6)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {team._count.quizzes} quiz
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
