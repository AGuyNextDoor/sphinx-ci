export async function updateCommitStatus(
  repo: string,
  sha: string,
  token: string,
  state: "pending" | "success" | "failure" | "error",
  description: string
) {
  const [owner, repoName] = repo.split("/");
  const url = `https://api.github.com/repos/${owner}/${repoName}/statuses/${sha}`;

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
      target_url:
        state === "pending"
          ? undefined
          : `${process.env.NEXT_PUBLIC_APP_URL}`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${body}`);
  }

  return response.json();
}
