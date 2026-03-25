import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-center mb-12" style={{ color: "#8b85a0" }}>
            Last updated: March 2026
          </p>

          <div className="space-y-6">
            {/* Intro */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <p style={{ color: "#b0a8c4" }}>
                sphinx-ci is an open-source project by{" "}
                <a href="https://skillberg.app" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#c9a84c" }}>
                  Skillberg
                </a>
                . We take your privacy seriously. Because sphinx-ci is open source, you can audit exactly how your data is handled by reviewing the source code.
              </p>
            </div>

            {/* Data We Collect */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Data We Collect
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">GitHub profile information</strong> &mdash; your username, email, avatar URL, and GitHub ID, obtained via GitHub OAuth during sign-in.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">Pull request diffs</strong> &mdash; temporarily fetched and stored in our database for quiz generation and regeneration on retry.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">Quiz answers</strong> &mdash; your responses to generated quiz questions, stored for history and analytics.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">Anthropic API keys</strong> &mdash; your API key, encrypted at rest using AES-256-GCM before storage.</span>
                </li>
              </ul>
            </div>

            {/* How We Use Your Data */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                How We Use Your Data
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Generate quiz questions from your pull request diffs using the Anthropic Claude API.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Post quiz results as PR comments and update commit status checks on GitHub.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Display quiz history and pass/fail analytics in your dashboard.</span>
                </li>
              </ul>
            </div>

            {/* Data Storage */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Data Storage
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                All data is stored in a PostgreSQL database hosted on Neon, managed through Vercel. Anthropic API keys are encrypted using AES-256-GCM before being written to the database. The encryption key is stored as a server-side environment variable and never exposed to the client.
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                The application is hosted on Vercel. All connections use HTTPS/TLS in transit.
              </p>
            </div>

            {/* Third-Party Services */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Third-Party Services
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                sphinx-ci integrates with the following third-party services. Each has its own privacy policy governing how your data is handled once shared with them:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">GitHub</strong> &mdash; OAuth authentication, PR comments, and status checks.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">Anthropic (Claude)</strong> &mdash; quiz generation via your own API key.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">Vercel</strong> &mdash; application hosting and serverless functions.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span><strong className="text-white">Neon</strong> &mdash; PostgreSQL database hosting.</span>
                </li>
              </ul>
              <p className="text-sm mt-3" style={{ color: "#8b85a0" }}>
                For a detailed breakdown, see our{" "}
                <Link href="/third-party" className="underline" style={{ color: "#c9a84c" }}>
                  Third-Party Services
                </Link>{" "}
                page.
              </p>
            </div>

            {/* Data Retention */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Data Retention
              </h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Quiz results and answers are stored indefinitely for your history.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>PR diffs are stored in the database to allow quiz regeneration on retry.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>You can request deletion of your data at any time by opening a GitHub issue.</span>
                </li>
              </ul>
            </div>

            {/* Cookies & Tracking */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Cookies &amp; Tracking
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                sphinx-ci does not use tracking or analytics cookies. The only cookies used are strictly necessary session cookies for authentication. We do not run any third-party analytics scripts, and we do not sell or share your data with advertisers.
              </p>
            </div>

            {/* Open Source */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Open Source Transparency
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                sphinx-ci is fully open source. You can audit exactly what data is collected and how it is processed by reviewing the{" "}
                <a
                  href="https://github.com/AGuyNextDoor/sphinx-ci"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#c9a84c" }}
                >
                  source code on GitHub
                </a>
                .
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Contact
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                If you have questions about this privacy policy or your data, please open an issue on our{" "}
                <a
                  href="https://github.com/AGuyNextDoor/sphinx-ci/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#c9a84c" }}
                >
                  GitHub repository
                </a>
                .
              </p>
              <p className="text-sm mt-2" style={{ color: "#8b85a0" }}>
                Company: Skillberg &mdash;{" "}
                <a href="https://skillberg.app" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#c9a84c" }}>
                  skillberg.app
                </a>
              </p>
            </div>
          </div>

          {/* Legal nav */}
          <div className="mt-12 pt-8 border-t flex flex-wrap justify-center gap-6 text-sm" style={{ borderColor: "#252036" }}>
            <Link href="/terms" className="underline" style={{ color: "#8b85a0" }}>
              Terms of Service
            </Link>
            <Link href="/third-party" className="underline" style={{ color: "#8b85a0" }}>
              Third-Party Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
