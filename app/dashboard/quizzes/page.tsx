import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En cours", className: "text-yellow-400 bg-yellow-400/10" },
  PASSED: { label: "Reussi", className: "text-green-400 bg-green-400/10" },
  FAILED: { label: "Echoue", className: "text-red-400 bg-red-400/10" },
  EXPIRED: { label: "Expire", className: "text-gray-400 bg-gray-400/10" },
};

export default async function QuizzesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quizzes = await prisma.quiz.findMany({
    where: { team: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { team: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Historique des quiz</h1>
      <p className="text-gray-400 text-sm mb-6">
        Les 50 derniers quiz generes sur tes repos.
      </p>

      {quizzes.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400">
            Aucun quiz pour le moment. Configure un repo et ouvre une PR pour
            commencer.
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="text-left px-4 py-3 font-medium">Repo</th>
                <th className="text-left px-4 py-3 font-medium">PR</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => {
                const status = statusLabels[quiz.status] || statusLabels.PENDING;
                return (
                  <tr
                    key={quiz.id}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                      {quiz.repo}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">
                        #{quiz.prNumber}
                      </span>
                      <span className="text-gray-500 ml-2 truncate max-w-[200px] inline-block align-bottom">
                        {quiz.prTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {quiz.score !== null ? `${quiz.score}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(quiz.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/q/${quiz.id}`}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
