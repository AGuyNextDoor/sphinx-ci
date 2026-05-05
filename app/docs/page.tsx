import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const GITHUB_REPO = "AGuyNextDoor/sphinx-ci";
const HUB_URL = "https://sphinx-ci.dev";

const WORKFLOW_YAML = `name: PR Quiz

on:
  issue_comment:
    types: [created]

permissions:
  contents: read
  pull-requests: write
  statuses: write

jobs:
  quiz:
    if: github.event.issue.pull_request && contains(github.event.comment.body, '@sphinx-ci')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Generate quiz
        env:
          PR_QUIZ_API_KEY: \${{ secrets.PR_QUIZ_API_KEY }}
          PR_QUIZ_HUB_URL: \${{ vars.PR_QUIZ_HUB_URL }}
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          # See the full file in the repo for the complete script
          curl -X POST "$PR_QUIZ_HUB_URL/api/quiz" \\
            -H "X-API-Key: $PR_QUIZ_API_KEY" \\
            -d "{ ... }"
`;

type Section = {
  id: string;
  title: string;
};

const sections = {
  en: [
    { id: "overview", title: "Overview" },
    { id: "quickstart", title: "Quickstart" },
    { id: "workflow", title: "Workflow file" },
    { id: "configuration", title: "Configuration" },
    { id: "usage", title: "Usage" },
    { id: "teams", title: "Teams & organizations" },
    { id: "self-host", title: "Self-hosting" },
    { id: "troubleshooting", title: "Troubleshooting" },
  ] satisfies Section[],
  fr: [
    { id: "overview", title: "Vue d'ensemble" },
    { id: "quickstart", title: "Démarrage rapide" },
    { id: "workflow", title: "Fichier workflow" },
    { id: "configuration", title: "Configuration" },
    { id: "usage", title: "Utilisation" },
    { id: "teams", title: "Équipes & organisations" },
    { id: "self-host", title: "Auto-hébergement" },
    { id: "troubleshooting", title: "Dépannage" },
  ] satisfies Section[],
};

const copy = {
  en: {
    title: "Documentation",
    subtitle: "Everything you need to install, configure, and run sphinx-ci on your repos.",
    onThisPage: "On this page",
    overviewBody:
      "sphinx-ci generates an AI quiz from each Pull Request diff. The developer proves they understand their own code before the merge — or they go back and read it again. Comment @sphinx-ci on a PR, the Sphinx generates a quiz from the diff, the dev answers, and the merge is unlocked or blocked based on the score.",
    overviewHowTitle: "How it works",
    overviewHow: [
      "GitHub Action sends the PR diff to the hub when a comment matches the trigger keyword.",
      "The hub generates N questions via Claude using your own Anthropic API key.",
      "A status check is posted on the commit, and a comment with the quiz link is posted on the PR.",
      "The developer answers in the browser. The score is calculated server-side.",
      "The status check is updated to success or failure based on the score.",
    ],
    quickstartIntro: "Five steps to get sphinx-ci running on a repo.",
    quickstartSteps: [
      {
        title: "Sign in on sphinx-ci",
        body: 'Go to sphinx-ci.dev and click "Get started with GitHub". The app requests the repo scope so it can post comments and status checks on your PRs.',
      },
      {
        title: "Configure your repo",
        body: "In the dashboard, open the Repos tab, find the repo you want to protect, click Configure, set the quiz parameters (questions, passing score, attempts, language, trigger keyword), then click Generate API key. Copy the spx_… key.",
      },
      {
        title: "Add secrets and variables to your GitHub repo",
        body: "In your GitHub repo settings, under Secrets and variables → Actions, add PR_QUIZ_API_KEY (the spx_… key) and ANTHROPIC_API_KEY (your sk-ant-… key) as secrets, and PR_QUIZ_HUB_URL (https://sphinx-ci.dev) as a variable.",
      },
      {
        title: "Add the workflow file",
        body: "Copy .github/workflows/pr-quiz.yml from the sphinx-ci repo to your own repo's main branch.",
      },
      {
        title: "(Optional) Enable branch protection",
        body: "In Settings → Branches, add a branch protection rule for main, check Require status checks to pass before merging, and add the pr-quiz status check. Without this, the quiz is informational but won't block the merge.",
      },
    ],
    workflowIntro:
      "The workflow file lives at .github/workflows/pr-quiz.yml in your repo. It triggers on PR comments containing the trigger keyword, sends the diff to the hub, and reports back. The full file is in the sphinx-ci GitHub repo — here is the shape:",
    workflowFootnote:
      "GITHUB_TOKEN is provided automatically by GitHub Actions. The Anthropic key stays in your GitHub repo secrets and is sent directly to the hub at request time.",
    configIntro: "All quiz parameters are configurable per repo from the dashboard.",
    configRows: [
      ["Questions", "Number of questions per quiz", "10"],
      ["Passing score", "Minimum score to unlock the merge", "70%"],
      ["Attempts", "Maximum number of attempts per PR", "3"],
      ["Language", "Language used for the quiz questions", "English"],
      ["Keyword", "Keyword in a PR comment that triggers the quiz", "@sphinx-ci"],
    ],
    configEdit:
      "To change settings, go to Dashboard → Repos, click Edit on the repo, change the values, then Save. You can also Reset key to invalidate the current key, or Revoke to remove the configuration entirely.",
    usageSteps: [
      "A developer opens a PR.",
      "Someone comments @sphinx-ci on the PR.",
      "The Sphinx generates a quiz and posts a comment with the link.",
      "The developer answers the quiz in their browser.",
      "A result comment is posted on the PR. Passed → merge unlocked. Not yet → retry link if attempts remaining. Out of attempts → status check failure, merge blocked.",
    ],
    teamsBody:
      "sphinx-ci works with GitHub organization repos. One admin signs in, configures the repo, adds the secrets and the workflow. From then on, all developers with access to the repo can trigger and take quizzes — they don't need a sphinx-ci account.",
    teamsAccessTitle: "Granting access to organization repos",
    teamsAccess: [
      "Go to github.com/settings/applications.",
      "Find sphinx-ci in the list and click it.",
      "Request access for your organization, then have an org admin approve.",
      "Or: an org admin can pre-approve sphinx-ci from Organization settings → Third-party access.",
    ],
    selfHostIntro: "If you want to host your own sphinx-ci instance:",
    selfHostSteps: [
      "Create a Vercel account, a PostgreSQL database (Neon, Supabase, or Vercel Postgres), and a GitHub OAuth App pointing to your domain.",
      "Configure environment variables on Vercel: DATABASE_URL, NEXT_PUBLIC_APP_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET.",
      "Deploy by connecting the repo to Vercel — migrations run automatically during the build.",
    ],
    selfHostFootnote: "The full self-hosting guide is in the README on GitHub.",
    troubleshootingRows: [
      ["Workflow doesn't trigger", "Make sure pr-quiz.yml is on the main branch and the comment contains the trigger keyword."],
      ["exit code 22", "Check PR_QUIZ_API_KEY (secret) and PR_QUIZ_HUB_URL (variable) in GitHub settings."],
      ["exit code 7", "PR_QUIZ_HUB_URL points to localhost instead of the public hub URL."],
      ["No result comment on PR", "Sign out and back in on sphinx-ci to refresh the OAuth token."],
      ["Org repos not visible", "Authorize sphinx-ci for your organization at github.com/settings/applications."],
    ],
    relatedTitle: "Related",
    relatedSupport: "Support & FAQ",
    relatedStatus: "Service status",
    relatedRepo: "Source on GitHub",
  },
  fr: {
    title: "Documentation",
    subtitle: "Tout pour installer, configurer et utiliser sphinx-ci sur tes repos.",
    onThisPage: "Sur cette page",
    overviewBody:
      "sphinx-ci génère un quiz IA à partir de chaque diff de Pull Request. Le développeur prouve qu'il comprend son propre code avant le merge — ou il y retourne. On commente @sphinx-ci sur une PR, le Sphinx génère un quiz à partir du diff, le dev répond, et le merge est débloqué ou bloqué selon le score.",
    overviewHowTitle: "Comment ça marche",
    overviewHow: [
      "L'Action GitHub envoie le diff de la PR au hub quand un commentaire contient le mot-clé.",
      "Le hub génère N questions via Claude en utilisant ta clé Anthropic.",
      "Un status check est posé sur le commit, et un commentaire avec le lien du quiz est posté sur la PR.",
      "Le dev répond dans son navigateur. Le score est calculé côté serveur.",
      "Le status check passe à success ou failure selon le score.",
    ],
    quickstartIntro: "Cinq étapes pour activer sphinx-ci sur un repo.",
    quickstartSteps: [
      {
        title: "Se connecter sur sphinx-ci",
        body: 'Va sur sphinx-ci.dev et clique sur "Get started with GitHub". L\'app demande le scope repo pour pouvoir poster des commentaires et des status checks sur tes PRs.',
      },
      {
        title: "Configurer ton repo",
        body: "Dans le dashboard, ouvre l'onglet Repos, trouve ton repo, clique sur Configure, règle les paramètres (nombre de questions, score min, tentatives, langue, mot-clé), puis Generate API key. Copie la clé spx_….",
      },
      {
        title: "Ajouter les secrets et variables au repo GitHub",
        body: "Dans les settings du repo, sous Secrets and variables → Actions, ajoute PR_QUIZ_API_KEY (la clé spx_…) et ANTHROPIC_API_KEY (ta clé sk-ant-…) en tant que secrets, et PR_QUIZ_HUB_URL (https://sphinx-ci.dev) en variable.",
      },
      {
        title: "Ajouter le fichier workflow",
        body: "Copie .github/workflows/pr-quiz.yml depuis le repo sphinx-ci vers la branche main de ton repo.",
      },
      {
        title: "(Optionnel) Activer la branch protection",
        body: "Dans Settings → Branches, crée une règle pour main, coche Require status checks to pass before merging, et ajoute le check pr-quiz. Sans ça, le quiz est informatif mais ne bloque pas le merge.",
      },
    ],
    workflowIntro:
      "Le workflow se trouve dans .github/workflows/pr-quiz.yml de ton repo. Il se déclenche sur les commentaires de PR contenant le mot-clé, envoie le diff au hub, et fait remonter le résultat. Voici la forme du fichier (le contenu complet est dans le repo sphinx-ci) :",
    workflowFootnote:
      "GITHUB_TOKEN est fourni automatiquement par GitHub Actions. Ta clé Anthropic reste dans les secrets de ton repo et est envoyée directement au hub au moment de la requête.",
    configIntro: "Tous les paramètres du quiz se règlent par repo depuis le dashboard.",
    configRows: [
      ["Questions", "Nombre de questions par quiz", "10"],
      ["Score min", "Score minimum pour débloquer le merge", "70%"],
      ["Tentatives", "Nombre maximum de tentatives par PR", "3"],
      ["Langue", "Langue des questions du quiz", "Anglais"],
      ["Mot-clé", "Mot-clé qui déclenche le quiz dans un commentaire", "@sphinx-ci"],
    ],
    configEdit:
      "Pour modifier les réglages, va dans Dashboard → Repos, clique sur Edit, change les valeurs, puis Save. Tu peux aussi Reset key pour invalider la clé courante, ou Revoke pour supprimer la configuration.",
    usageSteps: [
      "Un dev ouvre une PR.",
      "Quelqu'un commente @sphinx-ci sur la PR.",
      "Le Sphinx génère un quiz et poste un commentaire avec le lien.",
      "Le dev répond au quiz dans son navigateur.",
      "Un commentaire de résultat est posté sur la PR. Réussi → merge débloqué. Pas encore → lien pour réessayer si tentatives restantes. Plus de tentatives → status check failure, merge bloqué.",
    ],
    teamsBody:
      "sphinx-ci fonctionne avec les repos d'organisation GitHub. Un admin se connecte, configure le repo, ajoute les secrets et le workflow. Ensuite, tous les devs avec accès au repo peuvent déclencher et passer les quiz — ils n'ont pas besoin d'un compte sphinx-ci.",
    teamsAccessTitle: "Donner accès aux repos d'organisation",
    teamsAccess: [
      "Va sur github.com/settings/applications.",
      "Trouve sphinx-ci dans la liste et clique dessus.",
      "Demande l'accès pour ton organisation, puis fais approuver par un admin.",
      "Ou : un admin peut pré-approuver sphinx-ci depuis Organization settings → Third-party access.",
    ],
    selfHostIntro: "Pour héberger ta propre instance sphinx-ci :",
    selfHostSteps: [
      "Crée un compte Vercel, une base PostgreSQL (Neon, Supabase, ou Vercel Postgres), et une OAuth App GitHub pointant vers ton domaine.",
      "Configure les variables d'environnement sur Vercel : DATABASE_URL, NEXT_PUBLIC_APP_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET.",
      "Déploie en connectant le repo à Vercel — les migrations s'exécutent automatiquement au build.",
    ],
    selfHostFootnote: "Le guide d'auto-hébergement complet est dans le README sur GitHub.",
    troubleshootingRows: [
      ["Le workflow ne se déclenche pas", "Vérifie que pr-quiz.yml est sur la branche main et que le commentaire contient le mot-clé."],
      ["exit code 22", "Vérifie PR_QUIZ_API_KEY (secret) et PR_QUIZ_HUB_URL (variable) dans les settings GitHub."],
      ["exit code 7", "PR_QUIZ_HUB_URL pointe sur localhost au lieu de l'URL publique du hub."],
      ["Pas de commentaire de résultat sur la PR", "Déconnecte-toi et reconnecte-toi sur sphinx-ci pour rafraîchir le token OAuth."],
      ["Repos d'org invisibles", "Autorise sphinx-ci pour ton org sur github.com/settings/applications."],
    ],
    relatedTitle: "Voir aussi",
    relatedSupport: "Support & FAQ",
    relatedStatus: "Statut du service",
    relatedRepo: "Code source sur GitHub",
  },
};

export const metadata = {
  title: "Documentation — sphinx-ci",
  description: "Install, configure, and run sphinx-ci on your repos.",
};

export default async function DocsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const c = copy[locale];
  const toc = sections[locale];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#252036" }}>
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sphinx-logo.svg" alt="" width={28} height={28} />
          <span className="text-lg font-bold" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
            sphinx-ci
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ background: "#c9a84c", color: "#0f0c1a" }}
          >
            {t.nav.start}
          </Link>
        </div>
      </nav>

      <div className="flex-1 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
              {c.title}
            </h1>
            <p className="max-w-2xl mx-auto" style={{ color: "#b0a8c4" }}>
              {c.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-10">
            {/* Sidebar TOC */}
            <aside className="md:sticky md:top-6 md:self-start">
              <div className="rounded-xl p-5 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "#8b85a0" }}>
                  {c.onThisPage}
                </p>
                <ul className="space-y-2">
                  {toc.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="text-sm hover:underline" style={{ color: "#b0a8c4" }}>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <div className="space-y-8 min-w-0">
              {/* Overview */}
              <section id="overview" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[0].title}
                </h2>
                <p className="text-sm mb-4" style={{ color: "#b0a8c4" }}>
                  {c.overviewBody}
                </p>
                <h3 className="text-white font-semibold mb-3 mt-6">{c.overviewHowTitle}</h3>
                <ol className="space-y-2">
                  {c.overviewHow.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Quickstart */}
              <section id="quickstart" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[1].title}
                </h2>
                <p className="text-sm mb-6" style={{ color: "#b0a8c4" }}>
                  {c.quickstartIntro}
                </p>
                <ol className="space-y-5">
                  {c.quickstartSteps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-white font-medium mb-1">{step.title}</h3>
                        <p className="text-sm" style={{ color: "#b0a8c4" }}>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Workflow file */}
              <section id="workflow" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[2].title}
                </h2>
                <p className="text-sm mb-4" style={{ color: "#b0a8c4" }}>
                  {c.workflowIntro}
                </p>
                <pre
                  className="rounded-lg p-4 text-xs overflow-x-auto border"
                  style={{ background: "#0f0c1a", borderColor: "#252036", color: "#d8d2e8" }}
                >
                  <code>{WORKFLOW_YAML}</code>
                </pre>
                <p className="text-xs mt-4" style={{ color: "#8b85a0" }}>
                  {c.workflowFootnote}
                </p>
                <a
                  href={`https://github.com/${GITHUB_REPO}/blob/main/.github/workflows/pr-quiz.yml`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-sm underline"
                  style={{ color: "#c9a84c" }}
                >
                  {locale === "en" ? "View full workflow file" : "Voir le fichier complet"} →
                </a>
              </section>

              {/* Configuration */}
              <section id="configuration" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[3].title}
                </h2>
                <p className="text-sm mb-5" style={{ color: "#b0a8c4" }}>
                  {c.configIntro}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "#252036" }}>
                        <th className="text-left py-2 pr-4 text-white font-medium">{locale === "en" ? "Setting" : "Paramètre"}</th>
                        <th className="text-left py-2 pr-4 text-white font-medium">{locale === "en" ? "Description" : "Description"}</th>
                        <th className="text-left py-2 text-white font-medium">{locale === "en" ? "Default" : "Défaut"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.configRows.map(([name, desc, def], i) => (
                        <tr key={i} className="border-b last:border-b-0" style={{ borderColor: "#252036" }}>
                          <td className="py-3 pr-4 align-top">
                            <span className="text-white font-medium">{name}</span>
                          </td>
                          <td className="py-3 pr-4 align-top" style={{ color: "#b0a8c4" }}>{desc}</td>
                          <td className="py-3 align-top" style={{ color: "#c9a84c", fontFamily: "monospace" }}>{def}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm mt-5" style={{ color: "#b0a8c4" }}>
                  {c.configEdit}
                </p>
              </section>

              {/* Usage */}
              <section id="usage" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[4].title}
                </h2>
                <ol className="space-y-2">
                  {c.usageSteps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Teams */}
              <section id="teams" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[5].title}
                </h2>
                <p className="text-sm mb-5" style={{ color: "#b0a8c4" }}>
                  {c.teamsBody}
                </p>
                <h3 className="text-white font-semibold mb-3">{c.teamsAccessTitle}</h3>
                <ol className="space-y-2">
                  {c.teamsAccess.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Self-host */}
              <section id="self-host" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[6].title}
                </h2>
                <p className="text-sm mb-5" style={{ color: "#b0a8c4" }}>
                  {c.selfHostIntro}
                </p>
                <ol className="space-y-2 mb-5">
                  {c.selfHostSteps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs" style={{ color: "#8b85a0" }}>
                  {c.selfHostFootnote}
                </p>
              </section>

              {/* Troubleshooting */}
              <section id="troubleshooting" className="rounded-xl p-6 border scroll-mt-24" style={{ background: "#1a1628", borderColor: "#252036" }}>
                <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {toc[7].title}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "#252036" }}>
                        <th className="text-left py-2 pr-4 text-white font-medium">{locale === "en" ? "Problem" : "Problème"}</th>
                        <th className="text-left py-2 text-white font-medium">{locale === "en" ? "Solution" : "Solution"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.troubleshootingRows.map(([problem, solution], i) => (
                        <tr key={i} className="border-b last:border-b-0" style={{ borderColor: "#252036" }}>
                          <td className="py-3 pr-4 align-top">
                            <span className="text-white font-medium">{problem}</span>
                          </td>
                          <td className="py-3 align-top" style={{ color: "#b0a8c4" }}>{solution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Related */}
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <Link
                  href="/support"
                  className="rounded-xl p-4 border text-sm transition-colors"
                  style={{ background: "#1a1628", borderColor: "#252036", color: "#b0a8c4" }}
                >
                  <span className="block text-white font-medium mb-1">{c.relatedSupport}</span>
                  {locale === "en" ? "FAQ and contact" : "FAQ et contact"}
                </Link>
                <Link
                  href="/status"
                  className="rounded-xl p-4 border text-sm transition-colors"
                  style={{ background: "#1a1628", borderColor: "#252036", color: "#b0a8c4" }}
                >
                  <span className="block text-white font-medium mb-1">{c.relatedStatus}</span>
                  {locale === "en" ? "Live service health" : "État en direct"}
                </Link>
                <a
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-4 border text-sm transition-colors"
                  style={{ background: "#1a1628", borderColor: "#252036", color: "#b0a8c4" }}
                >
                  <span className="block text-white font-medium mb-1">{c.relatedRepo}</span>
                  {HUB_URL.replace("https://", "")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
