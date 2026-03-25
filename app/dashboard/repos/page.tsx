import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserRepos } from "@/lib/github-api";
import RepoCard from "@/components/RepoCard";
import { getLocale, getDictionary } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function ReposPage() {
  const session = await auth();
  if (!session?.user || !session.accessToken) redirect("/login");
  const locale = await getLocale();
  const t = getDictionary(locale);

  const repos = await getUserRepos(session.accessToken);
  const repoNames = repos.map((r) => r.full_name);

  // Fetch teams owned by the current user
  const myTeams = await prisma.team.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, apiKey: true, quizConfig: true },
  });
  const myTeamMap = new Map(myTeams.map((t) => [t.name, t]));

  // Fetch teams configured by others on repos the current user has access to
  const otherTeams = await prisma.team.findMany({
    where: {
      name: { in: repoNames },
      userId: { not: session.user.id },
    },
    select: { id: true, name: true, quizConfig: true, user: { select: { githubLogin: true } } },
  });
  const otherTeamMap = new Map(otherTeams.map((t) => [t.name, t]));

  const configuredByMe = repos.filter((r) => myTeamMap.has(r.full_name));
  const configuredByOthers = repos.filter(
    (r) => !myTeamMap.has(r.full_name) && otherTeamMap.has(r.full_name)
  );
  const available = repos.filter(
    (r) => !myTeamMap.has(r.full_name) && !otherTeamMap.has(r.full_name)
  );

  const totalConfigured = configuredByMe.length + configuredByOthers.length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
        {t.repos.title}
      </h1>
      <p className="text-sm mb-8" style={{ color: "#b0a8c4" }}>
        {t.repos.subtitle}
      </p>

      {/* Configured repos */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
          {t.repos.configured}
          <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
            {totalConfigured}
          </span>
        </h2>

        {totalConfigured === 0 ? (
          <div className="rounded-lg p-6 text-center border" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <p style={{ color: "#b0a8c4" }}>
              {t.repos.noneConfigured}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Repos configured by me — full control */}
            {configuredByMe.map((repo) => {
              const team = myTeamMap.get(repo.full_name)!;
              return (
                <RepoCard
                  key={repo.id}
                  repoFullName={repo.full_name}
                  repoName={repo.name}
                  isPrivate={repo.private}
                  language={repo.language}
                  description={repo.description}
                  configured={true}
                  apiKey={team.apiKey}
                  teamId={team.id}
                  initialConfig={team.quizConfig as any}
                  locale={locale}
                />
              );
            })}

            {/* Repos configured by someone else — read only */}
            {configuredByOthers.map((repo) => {
              const team = otherTeamMap.get(repo.full_name)!;
              const config = (team.quizConfig || {}) as Record<string, any>;
              return (
                <div
                  key={repo.id}
                  className="rounded-lg p-4 border"
                  style={{ background: "#1a1628", borderColor: "#252036" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium truncate">{repo.full_name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            repo.private ? "text-yellow-400 bg-yellow-400/10" : "text-gray-400 bg-gray-400/10"
                          }`}
                        >
                          {repo.private ? t.repos.private : t.repos.public}
                        </span>
                      </div>
                      {repo.description && <p className="text-sm text-gray-400 truncate">{repo.description}</p>}
                    </div>
                    <span
                      className="ml-4 px-3 py-1 text-xs font-medium rounded"
                      style={{ color: "#c9a84c", background: "rgba(201,168,76,0.1)" }}
                    >
                      {t.repoCard.configured}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {config.numQuestions || 10} {t.dashboard.questions}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {t.dashboard.scoreMin} {config.passingScore || 70}%
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}>
                      {config.keyword || "@sphinx-ci"}
                    </span>
                    <span className="text-xs" style={{ color: "#8b85a0" }}>
                      — {t.repos.configuredBy} {team.user?.githubLogin || t.repos.teamMember}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available repos — only shown to users who have configured at least one repo (admins) */}
      {configuredByMe.length > 0 && available.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
            {t.repos.available}
            <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: "rgba(94,88,120,0.2)", color: "#8b85a0" }}>
              {available.length}
            </span>
          </h2>

          <div className="space-y-3">
            {available.map((repo) => (
              <RepoCard
                key={repo.id}
                repoFullName={repo.full_name}
                repoName={repo.name}
                isPrivate={repo.private}
                language={repo.language}
                description={repo.description}
                configured={false}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}

      {/* First-time setup prompt for users with no repos configured */}
      {configuredByMe.length === 0 && configuredByOthers.length === 0 && available.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
            {t.repos.configureFirst}
          </h2>
          <div className="space-y-3">
            {available.map((repo) => (
              <RepoCard
                key={repo.id}
                repoFullName={repo.full_name}
                repoName={repo.name}
                isPrivate={repo.private}
                language={repo.language}
                description={repo.description}
                configured={false}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
