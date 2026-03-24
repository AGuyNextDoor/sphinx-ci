import { prisma } from "./db";

/**
 * Get the GitHub OAuth access token for a team's owner.
 * Falls back to the callbackToken if no OAuth token is found.
 */
export async function getGitHubToken(teamId: string, callbackToken: string): Promise<string> {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { userId: true },
    });
    if (team?.userId) {
      const account = await prisma.account.findFirst({
        where: { userId: team.userId, provider: "github" },
        select: { access_token: true },
      });
      if (account?.access_token) {
        return account.access_token;
      }
    }
  } catch {
    // Fall back to callback token
  }
  return callbackToken;
}

export async function updateCommitStatus(
  repo: string,
  sha: string,
  token: string,
  state: "pending" | "success" | "failure" | "error",
  description: string,
  targetUrl?: string
) {
  const [owner, repoName] = repo.split("/");
  const url = `https://api.github.com/repos/${owner}/${repoName}/statuses/${sha}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      state,
      context: "pr-quiz",
      description,
      target_url: targetUrl || (state === "pending" ? undefined : appUrl),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  return response.json();
}

export async function postPRComment(
  repo: string,
  prNumber: number,
  token: string,
  body: string
) {
  const [owner, repoName] = repo.split("/");
  const url = `https://api.github.com/repos/${owner}/${repoName}/issues/${prNumber}/comments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  return response.json();
}
