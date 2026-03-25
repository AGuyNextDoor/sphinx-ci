import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-center mb-12" style={{ color: "#8b85a0" }}>
            Last updated: March 2026
          </p>

          <div className="space-y-6">
            {/* Service Description */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Service Description
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                sphinx-ci is a free, open-source CI/CD tool that generates quizzes from pull request diffs to help developers understand code changes before merging. It is developed and maintained by{" "}
                <a href="https://skillberg.app" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#c9a84c" }}>
                  Skillberg
                </a>
                . By using sphinx-ci, you agree to these terms.
              </p>
            </div>

            {/* Account */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Account &amp; Authentication
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                You sign in to sphinx-ci using GitHub OAuth. By signing in, you authorize sphinx-ci to access your GitHub profile information and interact with your repositories as described in our{" "}
                <Link href="/privacy" className="underline" style={{ color: "#c9a84c" }}>Privacy Policy</Link>.
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                You are responsible for maintaining the security of your GitHub account and any API keys you provide. You must notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            {/* Acceptable Use */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Acceptable Use
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                You agree not to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Abuse the API or submit excessive requests designed to degrade the service.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Circumvent rate limits or other protective measures.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Use the service for any unlawful purpose or to process illegal content.</span>
                </li>
                <li className="flex items-start gap-3 text-sm" style={{ color: "#b0a8c4" }}>
                  <span className="mt-1 flex-shrink-0" style={{ color: "#c9a84c" }}>&#8226;</span>
                  <span>Attempt to access other users&apos; data or accounts.</span>
                </li>
              </ul>
            </div>

            {/* API Keys */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                API Keys
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                sphinx-ci requires you to provide your own Anthropic API key for quiz generation. Your key is encrypted using AES-256-GCM before storage and is only decrypted server-side when making requests to the Anthropic API on your behalf.
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                You are solely responsible for your Anthropic API key, its usage, and any costs incurred through the Anthropic API. sphinx-ci does not cover or reimburse Anthropic API charges.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Intellectual Property
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                Your code remains yours. sphinx-ci does not claim any ownership over your source code, pull request content, or any intellectual property you provide through the service.
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                Quiz questions are generated dynamically by the Anthropic Claude API based on your PR diffs. Generated questions are not stored long-term and are not considered proprietary content of sphinx-ci.
              </p>
            </div>

            {/* Service Availability */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Service Availability
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                sphinx-ci is provided on a best-effort basis. We do not guarantee any specific uptime or provide a Service Level Agreement (SLA).
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                The service is designed to be fail-open: if sphinx-ci is unavailable or the Anthropic API times out, your pull requests will not be blocked. CI/CD pipelines will continue normally.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Limitation of Liability
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                sphinx-ci is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                In no event shall Skillberg or the sphinx-ci maintainers be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profits, or business opportunities arising from your use of the service.
              </p>
            </div>

            {/* Termination */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Termination
              </h2>
              <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
                We reserve the right to suspend or terminate your access to sphinx-ci at any time, with or without cause, including for violation of these terms.
              </p>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                You may stop using sphinx-ci at any time. You can request deletion of your data by opening a GitHub issue on our repository.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Changes to Terms
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                We may update these terms from time to time. Changes will be reflected on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of sphinx-ci after changes constitutes acceptance of the revised terms.
              </p>
            </div>

            {/* Governing Law */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Governing Law
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                These terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction where Skillberg operates. Any disputes arising from these terms or your use of sphinx-ci shall be resolved in the competent courts of that jurisdiction.
              </p>
            </div>

            {/* Contact */}
            <div className="rounded-xl p-6 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
                Contact
              </h2>
              <p className="text-sm" style={{ color: "#b0a8c4" }}>
                If you have questions about these terms, please open an issue on our{" "}
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
            <Link href="/privacy" className="underline" style={{ color: "#8b85a0" }}>
              Privacy Policy
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
