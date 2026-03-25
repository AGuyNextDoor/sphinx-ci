import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const GITHUB_REPO = "AGuyNextDoor/sphinx-ci";

const faq = {
  en: [
    {
      q: "How do I install sphinx-ci on my repo?",
      a: "Sign in with GitHub, configure your repo in the dashboard, add the secrets and workflow file. See the full guide in the README.",
    },
    {
      q: "Do I need to create a GitHub App?",
      a: "No. sphinx-ci uses a GitHub OAuth App for login and the built-in GITHUB_TOKEN from Actions for status checks. No GitHub App installation needed.",
    },
    {
      q: "How much does it cost?",
      a: "sphinx-ci is free and open source. You only pay for your own Anthropic API usage (~$0.01 per quiz).",
    },
    {
      q: "Can I use it with my organization's repos?",
      a: "Yes. An org admin needs to approve the OAuth App first. Go to github.com/settings/applications, find sphinx-ci, and request access for your org.",
    },
    {
      q: "What happens if the service is down?",
      a: "sphinx-ci is fail-open. If the service is unavailable or Claude times out (30s), the PR is not blocked.",
    },
    {
      q: "Are my answers and code stored?",
      a: "The PR diff is stored in the database (needed to regenerate questions on retry). Anthropic API keys are encrypted with AES-256-GCM. Quiz answers are stored for history.",
    },
    {
      q: "Can I self-host sphinx-ci?",
      a: "Yes. Clone the repo, deploy on Vercel, and configure your own database and OAuth App. See the Self-hosting section in the README.",
    },
  ],
  fr: [
    {
      q: "Comment installer sphinx-ci sur mon repo ?",
      a: "Connecte-toi avec GitHub, configure ton repo dans le dashboard, ajoute les secrets et le fichier workflow. Voir le guide complet dans le README.",
    },
    {
      q: "Faut-il créer une GitHub App ?",
      a: "Non. sphinx-ci utilise une OAuth App GitHub pour le login et le GITHUB_TOKEN natif des Actions pour les status checks. Pas besoin d'installer une GitHub App.",
    },
    {
      q: "Combien ça coûte ?",
      a: "sphinx-ci est gratuit et open source. Tu ne paies que ton propre usage de l'API Anthropic (~0,01$ par quiz).",
    },
    {
      q: "Ça marche avec les repos d'organisation ?",
      a: "Oui. Un admin de l'org doit d'abord approuver l'OAuth App. Va sur github.com/settings/applications, trouve sphinx-ci, et demande l'accès pour ton org.",
    },
    {
      q: "Que se passe-t-il si le service est down ?",
      a: "sphinx-ci est fail-open. Si le service est indisponible ou que Claude timeout (30s), la PR n'est pas bloquée.",
    },
    {
      q: "Mes réponses et mon code sont-ils stockés ?",
      a: "Le diff de la PR est stocké en base (nécessaire pour régénérer les questions). Les clés API Anthropic sont chiffrées en AES-256-GCM. Les réponses aux quiz sont stockées pour l'historique.",
    },
    {
      q: "Puis-je auto-héberger sphinx-ci ?",
      a: "Oui. Clone le repo, déploie sur Vercel, et configure ta propre base de données et OAuth App. Voir la section Self-hosting dans le README.",
    },
  ],
};

export default async function SupportPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const questions = faq[locale];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
      {/* Nav */}
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: "Georgia, serif" }}>
            {locale === "en" ? "Support" : "Support"}
          </h1>
          <p className="text-center mb-12" style={{ color: "#b0a8c4" }}>
            {locale === "en"
              ? "Need help? Check the FAQ below or reach out."
              : "Besoin d'aide ? Consulte la FAQ ci-dessous ou contacte-nous."}
          </p>

          {/* Contact options */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <a
              href={`https://github.com/${GITHUB_REPO}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="feature-card rounded-xl p-5 border flex gap-4"
              style={{ borderColor: "#252036" }}
            >
              <div
                className="feature-icon flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,168,76,0.1)" }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#c9a84c" }}>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  {locale === "en" ? "Report a bug" : "Signaler un bug"}
                </h3>
                <p className="text-sm" style={{ color: "#b0a8c4" }}>
                  {locale === "en"
                    ? "Open a GitHub issue with details."
                    : "Ouvre une issue GitHub avec les détails."}
                </p>
              </div>
            </a>

            <a
              href={`https://github.com/${GITHUB_REPO}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              className="feature-card rounded-xl p-5 border flex gap-4"
              style={{ borderColor: "#252036" }}
            >
              <div
                className="feature-icon flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(201,168,76,0.1)" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  {locale === "en" ? "Ask a question" : "Poser une question"}
                </h3>
                <p className="text-sm" style={{ color: "#b0a8c4" }}>
                  {locale === "en"
                    ? "Start a discussion on GitHub."
                    : "Lance une discussion sur GitHub."}
                </p>
              </div>
            </a>
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "Georgia, serif" }}>
            FAQ
          </h2>
          <div className="space-y-4">
            {questions.map((item, i) => (
              <div
                key={i}
                className="rounded-xl p-5 border"
                style={{ background: "#1a1628", borderColor: "#252036" }}
              >
                <h3 className="text-white font-medium mb-2">{item.q}</h3>
                <p className="text-sm" style={{ color: "#b0a8c4" }}>{item.a}</p>
              </div>
            ))}
          </div>

          {/* Documentation link */}
          <div className="mt-12 text-center">
            <p className="mb-4" style={{ color: "#8b85a0" }}>
              {locale === "en"
                ? "For detailed setup instructions:"
                : "Pour les instructions détaillées :"}
            </p>
            <a
              href={`https://github.com/${GITHUB_REPO}#installation`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: "#252036", color: "#b0a8c4" }}
            >
              {locale === "en" ? "Read the documentation" : "Lire la documentation"} →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
