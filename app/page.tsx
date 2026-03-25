import SphinxLogo from "@/components/SphinxLogo";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth-options";
import DemoQuiz from "@/components/DemoQuiz";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const GITHUB_REPO = "AGuyNextDoor/sphinx-ci";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#252036" }}>
        <div className="flex items-center gap-2">
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sphinx-logo.svg" alt="" width={28} height={28} />
          <span className="text-lg font-bold" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
            sphinx-ci
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* GitHub stars badge */}
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors"
            style={{ borderColor: "#252036", color: "#b0a8c4" }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            
            <img
              src={`https://img.shields.io/github/stars/${GITHUB_REPO}?style=flat&label=stars&color=c9a84c&labelColor=1a1628`}
              alt="GitHub stars"
              className="h-5"
            />
          </a>

          <LanguageSwitcher locale={locale} />

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                {t.nav.dashboard}
              </Link>
              <div className="flex items-center gap-2">
                {session?.user?.image && (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-sm text-white">
                  {session?.user?.githubLogin || session?.user?.name}
                </span>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="text-sm transition-colors" style={{ color: "#b0a8c4" }}>
                  {t.nav.signOut}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block px-4 py-2 text-sm transition-colors" style={{ color: "#c9a84c" }}>
                {t.nav.signIn}
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                {t.nav.start}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <div className="flex justify-center mb-8">
            <SphinxLogo size={80} />
          </div>
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-6 tracking-wide uppercase"
            style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)", letterSpacing: "0.15em" }}
          >
            {t.landing.badge}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            {t.landing.title1}
            <br />
            <span style={{ color: "#c9a84c" }}>{t.landing.title2}</span>
          </h1>

          <p className="text-lg md:text-xl mb-10" style={{ color: "#b0a8c4" }}>
            {t.landing.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                {t.landing.ctaDashboard}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
                  style={{ background: "#c9a84c", color: "#0f0c1a" }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  {t.landing.ctaStart}
                </Link>
                <a
                  href={`https://github.com/${GITHUB_REPO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 text-base font-medium rounded-lg border transition-all inline-flex items-center gap-2"
                  style={{ borderColor: "#252036", color: "#b0a8c4" }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  {t.landing.ctaGitHub}
                </a>
              </>
            )}
          </div>

          <Link
            href="#demo"
            className="text-sm inline-block mb-16 animate-bounce"
            style={{ color: "#b0a8c4" }}
          >
            {t.landing.scrollDemo}
          </Link>
        </div>
      </section>

      {/* Demo quiz */}
      <section id="demo" className="px-4 py-20" style={{ background: "#1a1628" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {t.landing.demoTitle}
          </h2>
          <p className="text-center mb-10" style={{ color: "#b0a8c4" }}>
            {t.landing.demoSubtitle}
          </p>
          <DemoQuiz locale={locale} />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-2" style={{ fontFamily: "Georgia, serif" }}>
            {t.landing.howTitle}
          </h2>
          <p className="text-center mb-12" style={{ color: "#b0a8c4" }}>
            {t.landing.howSubtitle}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              {
                step: "Α",
                title: t.landing.step1title,
                desc: t.landing.step1desc,
              },
              {
                step: "Β",
                title: t.landing.step2title,
                desc: t.landing.step2desc,
              },
              {
                step: "Γ",
                title: t.landing.step3title,
                desc: t.landing.step3desc,
              },
              {
                step: "Δ",
                title: t.landing.step4title,
                desc: t.landing.step4desc,
              },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center">
                <div
                  className="step-card rounded-xl p-5 border text-center flex-1 h-full flex flex-col justify-start"
                  style={{ background: "#1a1628", borderColor: "#252036" }}
                >
                  <div
                    className="text-2xl font-bold mb-3"
                    style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-white font-semibold mb-2" style={{ fontFamily: "Georgia, serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#b0a8c4" }}>
                    {item.desc}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden md:block mx-1 text-lg" style={{ color: "#c9a84c", opacity: 0.4 }}>&#x25B8;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20" style={{ background: "#1a1628" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12" style={{ fontFamily: "Georgia, serif" }}>
            {t.landing.whyTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                ),
                title: t.landing.featLearn,
                desc: t.landing.featLearnDesc,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                ),
                title: t.landing.featCustom,
                desc: t.landing.featCustomDesc,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                ),
                title: t.landing.featFail,
                desc: t.landing.featFailDesc,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                ),
                title: t.landing.featSetup,
                desc: t.landing.featSetupDesc,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                ),
                title: t.landing.featAI,
                desc: t.landing.featAIDesc,
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                ),
                title: t.landing.featTeam,
                desc: t.landing.featTeamDesc,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card flex gap-4 rounded-xl p-5 border"
                style={{ borderColor: "#252036" }}
              >
                <div
                  className="feature-icon flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(201,168,76,0.1)" }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#c9a84c">
                    {feature.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1" style={{ fontFamily: "Georgia, serif" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#b0a8c4" }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div
          className="max-w-2xl mx-auto text-center rounded-2xl p-12 border"
          style={{ background: "#1a1628", borderColor: "#252036" }}
        >
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
            {t.landing.ctaTitle}
          </h2>
          <p className="mb-8" style={{ color: "#b0a8c4" }}>
            {t.landing.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                {t.landing.ctaDashboard}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {t.landing.ctaStart}
              </Link>
            )}
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-lg border transition-all"
              style={{ borderColor: "#252036", color: "#b0a8c4" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {t.landing.ctaGitHub}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t text-sm" style={{ borderColor: "#252036", color: "#8b85a0" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-3">
          <p>{t.landing.footer}</p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="transition-colors" style={{ color: "#b0a8c4" }}>
              Pricing
            </Link>
            <span style={{ color: "#252036" }}>·</span>
            <a
              href="https://skillberg.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "#b0a8c4" }}
            >
              Built by <span style={{ color: "#c9a84c" }}>Skillberg</span>
            </a>
            <span style={{ color: "#252036" }}>·</span>
            <a
              href={`https://github.com/${GITHUB_REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors"
              style={{ color: "#b0a8c4" }}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
