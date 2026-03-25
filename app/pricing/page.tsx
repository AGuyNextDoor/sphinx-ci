import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const features = {
  en: [
    "Unlimited repos",
    "Unlimited quizzes",
    "Unlimited team members",
    "Customizable quiz settings",
    "EN / FR language support",
    "GitHub Actions integration",
    "PR comments & status checks",
    "Bring your own Anthropic key",
  ],
  fr: [
    "Repos illimités",
    "Quiz illimités",
    "Membres d'équipe illimités",
    "Paramètres de quiz personnalisables",
    "Support EN / FR",
    "Intégration GitHub Actions",
    "Commentaires PR & status checks",
    "Votre propre clé Anthropic",
  ],
};

export default async function PricingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const featureList = features[locale];

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

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full">
          <h1 className="text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: "Georgia, serif" }}>
            {locale === "en" ? "Simple pricing" : "Tarif simple"}
          </h1>
          <p className="text-center mb-12" style={{ color: "#b0a8c4" }}>
            {locale === "en"
              ? "sphinx-ci is free and open source. You only pay for your own Anthropic API usage."
              : "sphinx-ci est gratuit et open source. Tu ne paies que ton propre usage de l'API Anthropic."}
          </p>

          {/* Card */}
          <div
            className="rounded-2xl p-8 border text-center"
            style={{ background: "#1a1628", borderColor: "#c9a84c" }}
          >
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c" }}
            >
              {locale === "en" ? "FOREVER" : "POUR TOUJOURS"}
            </div>
            <div className="mb-2">
              <span className="text-5xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                $0
              </span>
              <span className="text-lg" style={{ color: "#8b85a0" }}>
                /{locale === "en" ? "month" : "mois"}
              </span>
            </div>
            <p className="text-sm mb-8" style={{ color: "#b0a8c4" }}>
              {locale === "en"
                ? "No credit card required. No limits."
                : "Pas de carte bancaire. Aucune limite."}
            </p>

            <ul className="text-left space-y-3 mb-8">
              {featureList.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span style={{ color: "#c9a84c" }}>✓</span>
                  <span style={{ color: "#b0a8c4" }}>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-base font-semibold transition-all w-full justify-center"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              {t.nav.start}
            </Link>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#8b85a0" }}>
            {locale === "en"
              ? "Quiz generation uses Claude via your own Anthropic API key. Typical cost: ~$0.01 per quiz."
              : "La génération de quiz utilise Claude via ta propre clé API Anthropic. Coût typique : ~0,01$ par quiz."}
          </p>
        </div>
      </div>
    </div>
  );
}
