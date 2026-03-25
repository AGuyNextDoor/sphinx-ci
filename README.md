# sphinx-ci

Comme le Sphinx de la mythologie grecque, **sphinx-ci** bloque le merge d'une Pull Request tant que le developpeur n'a pas prouve sa comprehension de son propre code en repondant a un quiz genere par IA.

Commente `/sphinx` sur une PR → un quiz est genere depuis le diff → le dev repond → merge debloque ou bloque.

---

## Installation

### Prerequis

- Un compte GitHub
- Une cle API [Anthropic](https://console.anthropic.com) (`sk-ant-...`)

### Etape 1 — Se connecter sur sphinx-ci

1. Va sur **https://sphinx-ci.vercel.app**
2. Clique **Se connecter avec GitHub**
3. Autorise l'application a acceder a ton compte GitHub

> L'application demande le scope `repo` pour pouvoir poster des commentaires et des status checks sur tes PRs.

### Etape 2 — Configurer ton repo

1. Dans le dashboard, va dans l'onglet **Repos**
2. Trouve le repo sur lequel tu veux activer sphinx-ci
3. Clique **Configurer**
4. Remplis le formulaire :

| Champ | Description | Defaut |
|-------|-------------|--------|
| **Cle Anthropic API** | Ta cle `sk-ant-...` (obligatoire) | — |
| **Questions** | Nombre de questions par quiz | 10 |
| **Score min** | Score minimum pour debloquer le merge | 70% |
| **Tentatives** | Nombre de tentatives max | 3 |
| **Langue** | Langue des questions | Francais |
| **Keyword** | Mot-cle pour declencher le quiz dans un commentaire PR | `/sphinx` |

5. Clique **Generer la cle API**
6. **Copie la cle API** affichee (format `spx_...`) — tu en auras besoin a l'etape suivante

### Etape 3 — Ajouter le secret et la variable dans ton repo GitHub

Va dans ton repo GitHub : **Settings > Secrets and variables > Actions**

**Secrets** (onglet Secrets) — clique **New repository secret** pour chacun :

| Nom | Valeur |
|-----|--------|
| `PR_QUIZ_API_KEY` | La cle `spx_...` copiee a l'etape 2 |
| `ANTHROPIC_API_KEY` | Ta cle API Anthropic (`sk-ant-...`) |

**Variable** (onglet Variables) — clique **New repository variable** :

| Nom | Valeur |
|-----|--------|
| `PR_QUIZ_HUB_URL` | `https://sphinx-ci.vercel.app` |

> `GITHUB_TOKEN` est fourni automatiquement par GitHub Actions, rien a configurer.
> La cle Anthropic reste dans les secrets de ton repo GitHub — elle n'est jamais saisie sur le site sphinx-ci.

### Etape 4 — Ajouter le workflow GitHub Action

Cree le fichier `.github/workflows/pr-quiz.yml` dans ton repo :

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
              description: 'Quiz en attente...',
            });

      - name: Send diff to hub & post comment
        env:
          PR_QUIZ_API_KEY: ${{ secrets.PR_QUIZ_API_KEY }}
          PR_QUIZ_HUB_URL: ${{ vars.PR_QUIZ_HUB_URL }}
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
              \"callback_token\": \"$GITHUB_TOKEN\"
            }")

          QUIZ_URL=$(echo $RESPONSE | jq -r '.quiz_url')
          SKIPPED=$(echo $RESPONSE | jq -r '.skipped // false')

          if [ "$SKIPPED" = "true" ]; then
            echo "No code changes, skipping quiz."
            curl -sf -X POST "https://api.github.com/repos/${{ github.repository }}/statuses/${HEAD_SHA}" \
              -H "Authorization: token $GITHUB_TOKEN" \
              -H "Accept: application/vnd.github.v3+json" \
              -d '{"state":"success","context":"pr-quiz","description":"Pas de changement de code — quiz ignore"}'
            exit 0
          fi

          gh pr comment ${PR_NUMBER} --body "## Quiz de comprehension requis

          Pour debloquer le merge, complete ce quiz sur ton code.

          [$QUIZ_URL]($QUIZ_URL)

          *Le Sphinx attend ta reponse.*"
```

Commit et push ce fichier sur la branche principale de ton repo.

### Etape 5 (optionnel) — Activer la branch protection

Pour que le quiz **bloque reellement** le merge :

1. Dans ton repo : **Settings > Branches**
2. Clique **Add branch protection rule** (ou edite la regle existante)
3. Branch name pattern : `main` (ou `master`)
4. Coche **Require status checks to pass before merging**
5. Cherche et ajoute le status check : **`pr-quiz`**
6. Sauvegarde

> Sans cette etape, le quiz sera informatif mais ne bloquera pas le merge.

---

## Utilisation

1. Un developpeur ouvre une PR sur ton repo
2. Quelqu'un commente **`/sphinx`** sur la PR
3. Le Sphinx genere un quiz et poste un commentaire avec le lien
4. Le developpeur repond au quiz dans son navigateur
5. Un commentaire est poste sur la PR avec le resultat :
   - **Reussi** → status check `success`, merge debloque
   - **Pas encore reussi** → lien pour reessayer (si tentatives restantes)
   - **Toutes tentatives epuisees** → status check `failure`, merge bloque

---

## Equipes et organisations

sphinx-ci fonctionne avec les repos d'organisation GitHub. Un seul admin configure le tout, et tous les devs de l'equipe passent les quiz.

### Comment ca marche en equipe

1. **Un admin** se connecte sur sphinx-ci et configure le repo (genere la cle API, choisit les parametres)
2. **L'admin** ajoute les secrets dans les settings GitHub du repo (`PR_QUIZ_API_KEY`, `ANTHROPIC_API_KEY`) et le workflow
3. **Tous les devs** de l'equipe peuvent declencher et passer les quiz — il suffit d'avoir acces au repo

Les devs n'ont pas besoin de se connecter sur sphinx-ci. Seul l'admin qui configure a besoin d'un compte.

### Acceder aux repos d'une organisation

Par defaut, tu ne verras que tes repos personnels dans le dashboard. Pour voir les repos d'une organisation :

1. Va sur https://github.com/settings/applications
2. Trouve **sphinx-ci** dans la liste
3. Clique dessus et demande l'acces (**Request** ou **Grant**) pour ton organisation
4. Un admin de l'organisation doit approuver la demande

Alternativement, un admin de l'org peut pre-approuver l'app :
1. Aller dans **Organization settings > Third-party access**
2. Approuver sphinx-ci

Une fois approuve, les repos de l'org apparaitront dans ton dashboard.

---

## Modifier la configuration

Tu peux modifier les parametres d'un repo deja configure :

1. Va dans **Dashboard > Repos**
2. Clique **Modifier** sur le repo
3. Change les parametres (cle Anthropic, nombre de questions, etc.)
4. Clique **Sauvegarder**

Tu peux aussi :
- **Reset cle** — genere une nouvelle cle API (l'ancienne est invalidee)
- **Revoquer** — supprime la configuration et les quiz associes

---

## Comment ca marche sous le capot ?

### Architecture

- **Site central** (`sphinx-ci.vercel.app`) : application Next.js qui genere les quiz via Claude, les heberge, et rapporte les scores a GitHub
- **GitHub Action** : workflow dans chaque repo protege qui envoie le diff au site quand `/sphinx` est commente

> **Pas besoin de creer une GitHub App.** On utilise une OAuth App GitHub pour le login et le token OAuth de l'utilisateur pour poster les resultats sur les PRs.

### Flow technique

```
Commentaire /sphinx sur une PR
  → GitHub Action envoie le diff au hub
  → Le hub genere N questions via Claude (avec la cle Anthropic de l'utilisateur)
  → Quiz sauvegarde en DB, status check "pending" sur le commit
  → Commentaire poste sur la PR avec le lien du quiz
  → Le dev repond au quiz dans son navigateur
  → Le hub calcule le score cote serveur
  → Status check mis a jour (success/failure) via le token OAuth
  → Commentaire de resultat poste sur la PR
```

### Securite

- Les reponses correctes ne sont **jamais envoyees au navigateur** avant la soumission
- Le score est calcule **entierement cote serveur**
- A chaque tentative, de **nouvelles questions** sont generees pour favoriser l'apprentissage
- Chaque utilisateur fournit **sa propre cle Anthropic** (pas de cle partagee)

### Stack

- **Framework** : Next.js 14 (App Router)
- **Base de donnees** : PostgreSQL + Prisma ORM
- **LLM** : Anthropic Claude (claude-sonnet-4-20250514)
- **Auth** : NextAuth.js v5 avec GitHub OAuth
- **Deploiement** : Vercel

---

## Deployer ta propre instance

Si tu veux heberger ton propre site sphinx-ci :

### Prerequis

- Un compte [Vercel](https://vercel.com)
- Une base de donnees PostgreSQL ([Neon](https://neon.tech), [Supabase](https://supabase.com), ou Vercel Postgres)
- Une [OAuth App GitHub](https://github.com/settings/developers)

### Creer l'OAuth App GitHub

1. Va sur https://github.com/settings/developers
2. Clique **New OAuth App**
3. Remplis :
   - **Application name** : `sphinx-ci`
   - **Homepage URL** : `https://ton-domaine.vercel.app`
   - **Authorization callback URL** : `https://ton-domaine.vercel.app/api/auth/callback/github`
4. Note le **Client ID** et genere un **Client Secret**

### Variables d'environnement Vercel

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `NEXT_PUBLIC_APP_URL` | URL publique du site |
| `GITHUB_CLIENT_ID` | Client ID de l'OAuth App |
| `GITHUB_CLIENT_SECRET` | Client Secret de l'OAuth App |
| `AUTH_SECRET` | Secret pour les sessions (`openssl rand -base64 32`) |

### Deploiement

```bash
git clone https://github.com/AGuyNextDoor/sphinx-ci.git
cd sphinx-ci
npm install
cp .env.example .env
# Editer .env avec tes valeurs

# Initialiser la base de donnees
npx prisma migrate deploy

# Lancer en local
npm run dev
```

Pour deployer sur Vercel : connecte le repo depuis le dashboard Vercel et configure les variables d'environnement.

---

## Depannage

| Probleme | Solution |
|----------|----------|
| Le workflow ne se declenche pas | Verifie que `pr-quiz.yml` est sur la branche principale et que le commentaire contient le keyword (`/sphinx`) |
| Erreur `exit code 22` | Verifie `PR_QUIZ_API_KEY` (secret) et `PR_QUIZ_HUB_URL` (variable) dans les settings GitHub |
| Erreur `exit code 7` | `PR_QUIZ_HUB_URL` pointe vers `localhost` au lieu de l'URL Vercel |
| Pas de commentaire de resultat | Deconnecte/reconnecte-toi sur sphinx-ci pour rafraichir le token OAuth |
| `undefined` dans l'URL du quiz | Ajoute `NEXT_PUBLIC_APP_URL` dans les variables d'environnement Vercel |
| Repos d'organisation non visibles | Autorise sphinx-ci pour ton org dans https://github.com/settings/applications |
