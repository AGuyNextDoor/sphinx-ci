# sphinx-ci

[![GitHub stars](https://img.shields.io/github/stars/AGuyNextDoor/sphinx-ci?style=flat&color=c9a84c&labelColor=0f0c1a)](https://github.com/AGuyNextDoor/sphinx-ci)
[![License: MIT](https://img.shields.io/badge/license-MIT-c9a84c?labelColor=0f0c1a)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-white?labelColor=0f0c1a)](https://nextjs.org)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-c9a84c?labelColor=0f0c1a)](https://vercel.com)

**sphinx-ci** generates an AI quiz from each Pull Request diff. The developer proves they understand their own code before the merge — or they go back and read it again.

Comment `@sphinx-ci` on a PR → quiz generated from the diff → dev answers → merge unlocked or blocked.

---

## Installation

### Prerequisites

- A GitHub account
- An [Anthropic](https://console.anthropic.com) API key (`sk-ant-...`)

### Step 1 — Sign in on sphinx-ci

1. Go to **https://sphinx-ci.dev**
2. Click **Get started with GitHub**
3. Authorize the app to access your GitHub account

> The app requests the `repo` scope to post comments and status checks on your PRs.

### Step 2 — Configure your repo

1. In the dashboard, go to the **Repos** tab
2. Find the repo you want to protect
3. Click **Configure**
4. Fill in the settings:

| Setting | Description | Default |
|---------|-------------|---------|
| **Questions** | Number of questions per quiz | 10 |
| **Passing score** | Minimum score to unlock merge | 70% |
| **Attempts** | Max number of attempts | 3 |
| **Language** | Language of the questions | English |
| **Keyword** | Keyword to trigger the quiz in a PR comment | `@sphinx-ci` |

5. Click **Generate API key**
6. **Copy the API key** displayed (`spx_...`) — you'll need it in the next step

### Step 3 — Add secrets and variables to your GitHub repo

Go to your GitHub repo: **Settings > Secrets and variables > Actions**

**Secrets** (Secrets tab) — click **New repository secret** for each:

| Name | Value |
|------|-------|
| `PR_QUIZ_API_KEY` | The `spx_...` key copied in step 2 |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |

**Variables** (Variables tab) — click **New repository variable**:

| Name | Value |
|------|-------|
| `PR_QUIZ_HUB_URL` | `https://sphinx-ci.dev` |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions — nothing to configure.
> Your Anthropic key stays in your GitHub repo secrets — it is never entered on the sphinx-ci website.

### Step 4 — Add the GitHub Action workflow

Create the file `.github/workflows/pr-quiz.yml` in your repo:

```yaml
name: PR Quiz

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  statuses: write

jobs:
  quiz:
    if: github.event.issue.pull_request && contains(github.event.comment.body, '/sphinx')
    runs-on: ubuntu-latest
    steps:
      - name: Get PR details
        id: pr
        uses: actions/github-script@v7
        with:
          script: |
            const pr = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
            });
            core.setOutput('head_sha', pr.data.head.sha);
            core.setOutput('base_sha', pr.data.base.sha);
            core.setOutput('title', pr.data.title);

      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set pending status
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.repos.createCommitStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              sha: '${{ steps.pr.outputs.head_sha }}',
              state: 'pending',
              context: 'pr-quiz',
              description: 'Quiz pending...',
            });

      - name: Send diff to hub & post comment
        env:
          PR_QUIZ_API_KEY: ${{ secrets.PR_QUIZ_API_KEY }}
          PR_QUIZ_HUB_URL: ${{ vars.PR_QUIZ_HUB_URL }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          HEAD_SHA="${{ steps.pr.outputs.head_sha }}"
          BASE_SHA="${{ steps.pr.outputs.base_sha }}"
          PR_TITLE="${{ steps.pr.outputs.title }}"
          PR_NUMBER="${{ github.event.issue.number }}"

          DIFF=$(git diff ${BASE_SHA}...${HEAD_SHA} \
            -- '*.js' '*.ts' '*.jsx' '*.tsx' '*.py' '*.go' '*.java' '*.rs' '*.rb' '*.php' '*.cs' '*.cpp' \
            | head -c 12000)

          FILES=$(git diff --name-only ${BASE_SHA}...${HEAD_SHA} | tr '\n' ',' | sed 's/,$//')

          RESPONSE=$(curl -sf -X POST "$PR_QUIZ_HUB_URL/api/quiz" \
            -H "Content-Type: application/json" \
            -H "X-API-Key: $PR_QUIZ_API_KEY" \
            -d "{
              \"repo\": \"${{ github.repository }}\",
              \"pr_number\": ${PR_NUMBER},
              \"head_sha\": \"${HEAD_SHA}\",
              \"pr_title\": $(echo "$PR_TITLE" | jq -Rs .),
              \"diff\": $(echo "$DIFF" | jq -Rs .),
              \"files_changed\": $(echo "$FILES" | jq -Rs 'split(",")'),
              \"callback_token\": \"$GITHUB_TOKEN\",
              \"anthropic_api_key\": \"$ANTHROPIC_API_KEY\"
            }")

          QUIZ_URL=$(echo $RESPONSE | jq -r '.quiz_url')
          SKIPPED=$(echo $RESPONSE | jq -r '.skipped // false')

          if [ "$SKIPPED" = "true" ]; then
            echo "No code changes, skipping quiz."
            curl -sf -X POST "https://api.github.com/repos/${{ github.repository }}/statuses/${HEAD_SHA}" \
              -H "Authorization: token $GITHUB_TOKEN" \
              -H "Accept: application/vnd.github.v3+json" \
              -d '{"state":"success","context":"pr-quiz","description":"No code changes — quiz skipped"}'
            exit 0
          fi

          echo "Quiz created: $QUIZ_URL"
```

Commit and push this file to your repo's main branch.

### Step 5 (optional) — Enable branch protection

To make the quiz **actually block** the merge:

1. In your repo: **Settings > Branches**
2. Click **Add branch protection rule** (or edit existing)
3. Branch name pattern: `main` (or `master`)
4. Check **Require status checks to pass before merging**
5. Search and add the status check: **`pr-quiz`**
6. Save

> Without this step, the quiz is informational but won't block the merge.

---

## Usage

1. A developer opens a PR
2. Someone comments **`@sphinx-ci`** on the PR
3. The Sphinx generates a quiz and posts a comment with the link
4. The developer answers the quiz in their browser
5. A comment is posted on the PR with the result:
   - **Passed** → status check `success`, merge unlocked
   - **Not yet** → link to retry (if attempts remaining)
   - **All attempts used** → status check `failure`, merge blocked

---

## Teams & organizations

sphinx-ci works with GitHub organization repos. One admin configures everything, and all devs on the team take the quizzes.

### How it works for teams

1. **An admin** signs in on sphinx-ci and configures the repo (generates the API key, sets the quiz parameters)
2. **The admin** adds the secrets to the GitHub repo settings (`PR_QUIZ_API_KEY`, `ANTHROPIC_API_KEY`) and the workflow
3. **All devs** on the team can trigger and take quizzes — they just need access to the repo

Devs don't need to sign in on sphinx-ci. Only the admin who configures needs an account.

### Accessing organization repos

By default, you'll only see your personal repos in the dashboard. To see organization repos:

1. Go to https://github.com/settings/applications
2. Find **sphinx-ci** in the list
3. Click it and request access (**Request** or **Grant**) for your organization
4. An org admin must approve the request

Alternatively, an org admin can pre-approve the app:
1. Go to **Organization settings > Third-party access**
2. Approve sphinx-ci

Once approved, the org's repos will appear in your dashboard.

---

## Edit configuration

You can change the settings of an already-configured repo:

1. Go to **Dashboard > Repos**
2. Click **Edit** on the repo
3. Change the settings (number of questions, passing score, etc.)
4. Click **Save**

You can also:
- **Reset key** — generates a new API key (the old one is invalidated)
- **Revoke** — removes the configuration and associated quizzes

---

## How it works under the hood

### Architecture

- **Central hub** (`sphinx-ci.dev`): Next.js app that generates quizzes via Claude, hosts them, and reports scores to GitHub
- **GitHub Action**: workflow in each protected repo that sends the diff to the hub when `@sphinx-ci` is commented

> **No GitHub App needed.** We use a GitHub OAuth App for login and the user's OAuth token to post results on PRs.

### Technical flow

```
@sphinx-ci comment on a PR
  → GitHub Action sends the diff to the hub
  → Hub generates N questions via Claude (using the user's Anthropic key)
  → Quiz saved in DB, "pending" status check on the commit
  → Comment posted on the PR with the quiz link
  → Dev answers the quiz in their browser
  → Hub calculates the score server-side
  → Status check updated (success/failure) via OAuth token
  → Result comment posted on the PR
```

### Security

- Correct answers are **never sent to the browser** before submission
- Score is calculated **entirely server-side**
- On each attempt, **new questions** are generated to encourage learning
- Each user provides **their own Anthropic key** (no shared key)

### Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **LLM**: Anthropic Claude (claude-sonnet-4-20250514)
- **Auth**: NextAuth.js v5 with GitHub OAuth
- **Deployment**: Vercel

---

## Self-hosting

If you want to host your own sphinx-ci instance:

### Prerequisites

- A [Vercel](https://vercel.com) account
- A PostgreSQL database ([Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres)
- A [GitHub OAuth App](https://github.com/settings/developers)

### Create the GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: `sphinx-ci`
   - **Homepage URL**: `https://your-domain.vercel.app`
   - **Authorization callback URL**: `https://your-domain.vercel.app/api/auth/callback/github`
4. Note the **Client ID** and generate a **Client Secret**

### Vercel environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL |
| `NEXT_PUBLIC_APP_URL` | Public URL of the site |
| `GITHUB_CLIENT_ID` | OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | OAuth App Client Secret |
| `AUTH_SECRET` | Session secret (`openssl rand -base64 32`) |

### Deploy

```bash
git clone https://github.com/AGuyNextDoor/sphinx-ci.git
cd sphinx-ci
npm install
cp .env.example .env
# Edit .env with your values

# Initialize the database
npx prisma migrate deploy

# Run locally
npm run dev
```

To deploy on Vercel: connect the repo from the Vercel dashboard and configure the environment variables. Migrations run automatically during the build.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow doesn't trigger | Make sure `pr-quiz.yml` is on the main branch and the comment contains the keyword (`@sphinx-ci`) |
| `exit code 22` error | Check `PR_QUIZ_API_KEY` (secret) and `PR_QUIZ_HUB_URL` (variable) in GitHub settings |
| `exit code 7` error | `PR_QUIZ_HUB_URL` points to `localhost` instead of the Vercel URL |
| No result comment on PR | Sign out and sign back in on sphinx-ci to refresh the OAuth token |
| `undefined` in quiz URL | Add `NEXT_PUBLIC_APP_URL` to Vercel environment variables |
| Org repos not visible | Authorize sphinx-ci for your org at https://github.com/settings/applications |

---

Built by [Skillberg](https://skillberg.app)
