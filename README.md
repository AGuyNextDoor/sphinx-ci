# sphinx-ci

Comme le Sphinx de la mythologie grecque, **sphinx-ci** bloque le merge d'une Pull Request tant que le developpeur n'a pas prouve sa comprehension de son propre code en repondant a un quiz de 10 questions genere par IA.

**Score minimum pour merger : 70% — 3 tentatives — 48h max.**

## Comment ca marche ?

1. Connecte-toi avec GitHub sur sphinx-ci
2. Configure sphinx-ci sur tes repos (genere une cle API)
3. Ajoute le workflow GitHub Action a ton repo
4. A chaque PR, le Sphinx genere un quiz de 10 questions sur ton diff
5. Le developpeur repond au quiz via le lien poste sur la PR
6. Score >= 70% → merge debloque. Sinon, nouvelles questions (max 3 tentatives)

## Architecture

- **Site central** : application Next.js deployee sur Vercel. Les utilisateurs se connectent avec GitHub, configurent leurs repos, et passent les quiz
- **GitHub Action** : workflow a copier dans chaque repo protege. Envoie le diff au site et poste le lien du quiz

> **Pas besoin de creer une GitHub App.** On utilise une OAuth App GitHub pour le login sur le site, et le `GITHUB_TOKEN` automatique de GitHub Actions pour les status checks.

---

## Guide utilisateur — Ajouter sphinx-ci a ton repo

### Etape 1 — Se connecter sur le site

1. Va sur le site sphinx-ci (ex: `https://sphinx-ci.vercel.app`)
2. Clique sur **Se connecter avec GitHub**
3. Autorise l'application OAuth

### Etape 2 — Configurer ton repo

1. Dans le **Dashboard**, va dans l'onglet **Repos**
2. Tu verras la liste de tes repos GitHub
3. Clique sur **Configurer** sur le repo souhaite
4. Une cle API est generee (format `spx_...`). **Copie-la.**

### Etape 3 — Ajouter les secrets au repo GitHub

Dans ton repo GitHub : **Settings > Secrets and variables > Actions**

**Secrets** (onglet Secrets) :

| Nom | Valeur |
|-----|--------|
| `PR_QUIZ_API_KEY` | La cle API copiee a l'etape 2 |

**Variables** (onglet Variables) :

| Nom | Valeur |
|-----|--------|
| `PR_QUIZ_HUB_URL` | L'URL du site sphinx-ci, ex: `https://sphinx-ci.vercel.app` |

> `GITHUB_TOKEN` est fourni automatiquement par GitHub Actions, rien a configurer.

### Etape 4 — Ajouter le workflow GitHub Action

Cree le fichier `.github/workflows/pr-quiz.yml` dans ton repo :

```yaml
name: PR Quiz

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write
  statuses: write

jobs:
  quiz:
    runs-on: ubuntu-latest
    steps:
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
              sha: context.payload.pull_request.head.sha,
              state: 'pending',
              context: 'pr-quiz',
              description: 'Quiz en attente...',
            });

      - name: Send diff to hub & post comment
        env:
          PR_QUIZ_API_KEY: ${{ secrets.PR_QUIZ_API_KEY }}
          PR_QUIZ_HUB_URL: ${{ vars.PR_QUIZ_HUB_URL }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          DIFF=$(git diff ${{ github.event.pull_request.base.sha }}...${{ github.event.pull_request.head.sha }} \
            -- '*.js' '*.ts' '*.jsx' '*.tsx' '*.py' '*.go' '*.java' '*.rs' '*.rb' '*.php' '*.cs' '*.cpp' \
            | head -c 12000)

          FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }}...${{ github.event.pull_request.head.sha }} | tr '\n' ',' | sed 's/,$//')

          RESPONSE=$(curl -sf -X POST "$PR_QUIZ_HUB_URL/api/quiz" \
            -H "Content-Type: application/json" \
            -H "X-API-Key: $PR_QUIZ_API_KEY" \
            -d "{
              \"repo\": \"${{ github.repository }}\",
              \"pr_number\": ${{ github.event.pull_request.number }},
              \"head_sha\": \"${{ github.event.pull_request.head.sha }}\",
              \"pr_title\": $(echo '${{ github.event.pull_request.title }}' | jq -Rs .),
              \"diff\": $(echo \"$DIFF\" | jq -Rs .),
              \"files_changed\": $(echo \"$FILES\" | jq -Rs 'split(\",\")'),
              \"callback_token\": \"$GITHUB_TOKEN\"
            }")

          QUIZ_URL=$(echo $RESPONSE | jq -r '.quiz_url')
          SKIPPED=$(echo $RESPONSE | jq -r '.skipped // false')

          if [ "$SKIPPED" = "true" ]; then
            echo "No code changes, skipping quiz."
            curl -sf -X POST "https://api.github.com/repos/${{ github.repository }}/statuses/${{ github.event.pull_request.head.sha }}" \
              -H "Authorization: token $GITHUB_TOKEN" \
              -H "Accept: application/vnd.github.v3+json" \
              -d '{"state":"success","context":"pr-quiz","description":"Pas de changement de code — quiz ignore"}'
            exit 0
          fi

          gh pr comment ${{ github.event.pull_request.number }} --body "## Quiz de comprehension requis

          Pour debloquer le merge, complete ce quiz de 10 questions sur ton code.
          **Score minimum : 70%**

          [$QUIZ_URL]($QUIZ_URL)

          *Le Sphinx attend ta reponse — 48h, 3 tentatives maximum.*"
```

### Etape 5 — Activer la branch protection (optionnel mais recommande)

Pour que le quiz **bloque reellement** le merge :

1. Dans ton repo : **Settings > Branches**
2. Ajouter une regle de protection sur `main` (ou `master`)
3. Cocher **Require status checks to pass before merging**
4. Rechercher et ajouter le status check : **`pr-quiz`**

Sans cette etape, le quiz sera informatif mais ne bloquera pas le merge.

---

## Deployer ta propre instance

Si tu veux heberger ton propre site sphinx-ci :

### Prerequis

- Un compte [Vercel](https://vercel.com)
- Une base de donnees PostgreSQL ([Neon](https://neon.tech), [Supabase](https://supabase.com), ou Vercel Postgres)
- Une cle API [Anthropic](https://console.anthropic.com)
- Une [OAuth App GitHub](https://github.com/settings/developers) (voir ci-dessous)

### Creer l'OAuth App GitHub

1. Va sur https://github.com/settings/developers
2. Clique **New OAuth App**
3. Remplis :
   - **Application name** : `sphinx-ci` (ou le nom de ton choix)
   - **Homepage URL** : `https://ton-domaine.vercel.app`
   - **Authorization callback URL** : `https://ton-domaine.vercel.app/api/auth/callback/github`
4. Apres creation, note le **Client ID** et genere un **Client Secret**

### Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `ANTHROPIC_API_KEY` | Cle API Anthropic |
| `NEXT_PUBLIC_APP_URL` | URL publique du site |
| `GITHUB_CLIENT_ID` | Client ID de l'OAuth App |
| `GITHUB_CLIENT_SECRET` | Client Secret de l'OAuth App |
| `AUTH_SECRET` | Secret pour les sessions (generer avec `openssl rand -base64 32`) |

### Deploiement

```bash
git clone https://github.com/votre-org/sphinx-ci.git
cd sphinx-ci
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs

# Initialiser la base de donnees
npx prisma migrate dev --name init

# Lancer en local
npm run dev
```

Pour deployer sur Vercel : connecter le repo depuis le dashboard Vercel et configurer les variables d'environnement.

---

## FAQ

### Faut-il creer une GitHub App ?

**Non.** sphinx-ci utilise deux mecanismes distincts :
- **OAuth App GitHub** : pour la connexion des utilisateurs sur le site (login avec GitHub)
- **`GITHUB_TOKEN`** : le token automatique de GitHub Actions, pour poster les status checks et commentaires sur les PR

Tu n'as pas besoin d'une GitHub App (avec installation, webhooks, etc.).

### Quelle est la difference entre OAuth App et GitHub App ?

- **OAuth App** : authentifie un utilisateur. C'est ce que sphinx-ci utilise pour le login. Tu en crees une dans les settings GitHub.
- **GitHub App** : s'installe sur des repos avec des permissions granulaires. sphinx-ci n'en a pas besoin car le `GITHUB_TOKEN` des Actions suffit.

### Que se passe-t-il pour les PR sans code (docs, config) ?

Le workflow filtre le diff par extensions de fichiers code (`.js`, `.ts`, `.py`, etc.). Si le diff filtre est vide ou tres court (< 50 caracteres), le hub retourne `skipped: true` et le status check passe automatiquement.

### Que se passe-t-il si Claude est indisponible ?

Le hub a un timeout de 30 secondes. En cas d'echec, il retourne une erreur 503 et **ne bloque pas la PR** (fail-open).

### Les reponses correctes sont-elles visibles dans le navigateur ?

Non. Les reponses correctes ne sont jamais envoyees au client avant la soumission. Le calcul du score se fait entierement cote serveur.

### Le diff est-il stocke ?

Oui, en clair dans la base de donnees (necessaire pour regenerer les questions). Si votre code est sensible, deployez votre propre instance.

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Base de donnees** : PostgreSQL + Prisma ORM
- **LLM** : Anthropic Claude (claude-sonnet-4-20250514)
- **Auth** : NextAuth.js v5 avec GitHub OAuth
- **Deploiement** : Vercel
