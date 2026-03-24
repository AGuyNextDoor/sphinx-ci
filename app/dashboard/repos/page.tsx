import { auth } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserRepos } from "@/lib/github-api";
import RepoCard from "@/components/RepoCard";

export const dynamic = "force-dynamic";

export default async function ReposPage() {
  const session = await auth();
  if (!session?.user || !session.accessToken) redirect("/login");

  // Fetch user's GitHub repos
  const repos = await getUserRepos(session.accessToken);

  // Fetch configured teams for this user
  const teams = await prisma.team.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, apiKey: true },
  });

  const configuredRepos = new Map(teams.map((t) => [t.name, t]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Tes repos</h1>
      <p className="text-gray-400 text-sm mb-6">
        Configure sphinx-ci sur un repo pour generer une cle API. Ajoute
        ensuite le workflow GitHub Action.
      </p>

      <div className="space-y-3">
        {repos.map((repo) => {
          const team = configuredRepos.get(repo.full_name);
          return (
            <RepoCard
              key={repo.id}
              repoFullName={repo.full_name}
              repoName={repo.name}
              isPrivate={repo.private}
              language={repo.language}
              description={repo.description}
              configured={!!team}
              apiKey={team?.apiKey}
              teamId={team?.id}
            />
          );
        })}

        {repos.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              Aucun repo trouve. Verifie que ton token GitHub a les bonnes
              permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
