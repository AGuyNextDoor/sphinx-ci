export interface GitHubRepo {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  updated_at: string;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export async function getUserRepos(
  accessToken: string
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (page <= 5) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!res.ok) break;

    const data: GitHubRepo[] = await res.json();
    if (!data.length) break;
    repos.push(...data);
    if (data.length < 100) break;
    page++;
  }

  return repos;
}
