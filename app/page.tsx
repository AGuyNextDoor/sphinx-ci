import Link from "next/link";
import { auth } from "@/lib/auth-options";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#252036" }}>
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <path d="M50 8L90 35V65L50 92L10 65V35L50 8Z" stroke="#c9a84c" strokeWidth="4" fill="#c9a84c" fillOpacity="0.1" />
            <circle cx="38" cy="45" r="5" fill="#c9a84c" />
            <circle cx="62" cy="45" r="5" fill="#c9a84c" />
            <path d="M35 62C35 62 42 70 50 70C58 70 65 62 65 62" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-lg font-bold" style={{ color: "#c9a84c" }}>
            sphinx-ci
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm transition-colors"
                style={{ color: "#c9a84c" }}
              >
                Se connecter
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                Commencer
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-6 tracking-wide uppercase"
            style={{ background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            CI/CD pour la comprehension du code
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Le Sphinx qui garde
            <br />
            <span style={{ color: "#c9a84c" }}>tes Pull Requests</span>
          </h1>

          <p className="text-lg md:text-xl mb-10" style={{ color: "#8b85a0" }}>
            Bloque le merge tant que le developpeur n&apos;a pas prouve sa
            comprehension de son propre code. Quiz IA de 10 questions, genere
            depuis le diff.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                Aller au Dashboard
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
                  Commencer avec GitHub
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-8 py-3.5 text-base font-medium rounded-lg border transition-all"
                  style={{ borderColor: "#252036", color: "#8b85a0" }}
                >
                  Comment ca marche ?
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 text-sm" style={{ color: "#5e5878" }}>
            <div>
              <span className="font-bold text-white text-lg">70%</span>
              <p>Score minimum</p>
            </div>
            <div className="w-px h-8" style={{ background: "#252036" }} />
            <div>
              <span className="font-bold text-white text-lg">10</span>
              <p>Questions par quiz</p>
            </div>
            <div className="w-px h-8" style={{ background: "#252036" }} />
            <div>
              <span className="font-bold text-white text-lg">3</span>
              <p>Tentatives max</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 py-20" style={{ background: "#1a1628" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Comment ca marche ?
          </h2>
          <p className="text-center mb-12" style={{ color: "#8b85a0" }}>
            Trois etapes pour proteger tes repos.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connecte-toi",
                desc: "Connecte ton compte GitHub et configure sphinx-ci sur les repos de ton choix. Une cle API est generee automatiquement.",
              },
              {
                step: "02",
                title: "Ajoute le workflow",
                desc: "Copie le fichier GitHub Action dans ton repo. A chaque PR, le diff est envoye au Sphinx pour generer le quiz.",
              },
              {
                step: "03",
                title: "Passe le quiz",
                desc: "Le developpeur repond a 10 questions sur son propre code. Score >= 70% et le merge est debloque.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl p-6 border"
                style={{ background: "#0f0c1a", borderColor: "#252036" }}
              >
                <div
                  className="text-xs font-bold mb-3 tracking-widest"
                  style={{ color: "#c9a84c" }}
                >
                  ETAPE {item.step}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8b85a0" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pourquoi sphinx-ci ?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                ),
                title: "Anti-triche",
                desc: "Les reponses ne sont jamais envoyees au navigateur. Nouvelles questions a chaque tentative.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                ),
                title: "Fail-open",
                desc: "Si le service est indisponible, la PR n'est pas bloquee. Timeout de 30s sur la generation.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                  />
                ),
                title: "Setup en 5 min",
                desc: "Pas de GitHub App a installer. Un workflow YAML, une cle API, et c'est parti.",
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                  />
                ),
                title: "IA contextuelle",
                desc: "Les questions portent uniquement sur le diff de la PR. Pas de questions generiques.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl p-5 border"
                style={{ borderColor: "#252036" }}
              >
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.1)" }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#c9a84c"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#8b85a0" }}>
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
          <h2 className="text-3xl font-bold text-white mb-4">
            Pret a garder tes PRs ?
          </h2>
          <p className="mb-8" style={{ color: "#8b85a0" }}>
            Gratuit et open source. Configure en 5 minutes.
          </p>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              Aller au Dashboard
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
              Commencer avec GitHub
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t text-center text-sm" style={{ borderColor: "#252036", color: "#5e5878" }}>
        <p>sphinx-ci — Le Sphinx garde tes Pull Requests.</p>
      </footer>
    </div>
  );
}
