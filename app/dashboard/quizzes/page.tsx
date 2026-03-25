import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

const statusClasses: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10",
  PASSED: "bg-transparent",
  FAILED: "text-red-400 bg-red-400/10",
  EXPIRED: "bg-transparent",
};

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const locale = await getLocale();
  const t = getDictionary(locale);
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);

  const statusLabels: Record<string, string> = {
    PENDING: t.quizzes.pending,
    PASSED: t.quizzes.passed,
    FAILED: t.quizzes.failed,
    EXPIRED: t.quizzes.expired,
  };

  const totalCount = await prisma.quiz.count({
    where: { team: { userId: session.user.id } },
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const quizzes = await prisma.quiz.findMany({
    where: { team: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PER_PAGE,
    take: PER_PAGE,
    include: { team: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>{t.quizzes.title}</h1>
      <p className="text-sm mb-6" style={{ color: "#b0a8c4" }}>
        {t.quizzes.subtitle}
      </p>

      {quizzes.length === 0 && currentPage === 1 ? (
        <div className="rounded-lg p-6 text-center border" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <p style={{ color: "#b0a8c4" }}>
            {t.quizzes.empty}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b" style={{ borderColor: "#252036" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.quizzes.repo}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.quizzes.pr}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.quizzes.status}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.quizzes.score}</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#8b85a0" }}>{t.quizzes.date}</th>
                  <th className="text-left px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => {
                  const statusLabel = statusLabels[quiz.status] || statusLabels.PENDING;
                  const statusClass = statusClasses[quiz.status] || statusClasses.PENDING;
                  const isPassed = quiz.status === "PASSED";
                  const isExpired = quiz.status === "EXPIRED";
                  return (
                    <tr
                      key={quiz.id}
                      className="border-b transition-colors"
                      style={{ borderColor: "rgba(37,32,54,0.5)" }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "#b0a8c4" }}>
                        {quiz.repo}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white">#{quiz.prNumber}</span>
                        <span className="ml-2 truncate max-w-[200px] inline-block align-bottom" style={{ color: "#8b85a0" }}>
                          {quiz.prTitle}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${statusClass}`}
                          style={isPassed ? { color: "#c9a84c", background: "rgba(201,168,76,0.1)" } : isExpired ? { color: "#8b85a0", background: "rgba(139,133,160,0.1)" } : undefined}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "#b0a8c4" }}>
                        {quiz.score !== null ? `${quiz.score}%` : "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#8b85a0" }}>
                        {new Date(quiz.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/q/${quiz.id}`}
                          className="text-xs"
                          style={{ color: "#c9a84c" }}
                        >
                          {t.quizzes.view}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/dashboard/quizzes"
            labels={t.pagination}
          />
        </>
      )}
    </div>
  );
}
