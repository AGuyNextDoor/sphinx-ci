import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const services = [
  {
    name: "GitHub",
    purpose: "OAuth login, PR comments, and commit status checks.",
    dataShared: "GitHub profile information (username, email, avatar), PR metadata, and diff content.",
    policyUrl: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement",
  },
  {
    name: "Anthropic (Claude API)",
    purpose: "AI-powered quiz generation from pull request diffs.",
    dataShared: "PR diff content, sent via your own Anthropic API key. sphinx-ci does not use a shared key.",
    policyUrl: "https://www.anthropic.com/privacy",
  },
  {
    name: "Vercel",
    purpose: "Application hosting, serverless functions, and edge network.",
    dataShared: "Application logs, HTTP request data, and deployment artifacts.",
    policyUrl: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Neon",
    purpose: "PostgreSQL database hosting for all persistent data.",
    dataShared: "All stored data including user profiles, quiz results, repository configurations, and encrypted API keys.",
    policyUrl: "https://neon.tech/privacy-policy",
  },
  {
    name: "Upstash",
    purpose: "Redis-based rate limiting (optional, if configured).",
    dataShared: "Rate limit counters and request metadata. No user content is stored.",
    policyUrl: "https://upstash.com/trust/privacy.pdf",
  },
];

export default async function ThirdPartyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Third-Party Services
          </h1>
          <p className="text-center mb-12" style={{ color: "#8b85a0" }}>
            Last updated: March 2026
          </p>

          <div className="rounded-xl p-6 border mb-8" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <p style={{ color: "#b0a8c4" }}>
              sphinx-ci integrates with several third-party services to provide its functionality. Below is a complete list of these services, what they are used for, what data is shared with each, and links to their respective privacy policies.
            </p>
          </div>

          <div className="space-y-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="rounded-xl p-6 border"
                style={{ background: "#1a1628", borderColor: "#252036" }}
              >
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  {service.name}
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8b85a0" }}>
                      Purpose
                    </h3>
                    <p className="text-sm" style={{ color: "#b0a8c4" }}>
                      {service.purpose}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8b85a0" }}>
                      Data Shared
                    </h3>
                    <p className="text-sm" style={{ color: "#b0a8c4" }}>
                      {service.dataShared}
                    </p>
                  </div>
                  <div>
                    <a
                      href={service.policyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm underline"
                      style={{ color: "#c9a84c" }}
                    >
                      Privacy Policy
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal nav */}
          <div className="mt-12 pt-8 border-t flex flex-wrap justify-center gap-6 text-sm" style={{ borderColor: "#252036" }}>
            <Link href="/privacy" className="underline" style={{ color: "#8b85a0" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="underline" style={{ color: "#8b85a0" }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
