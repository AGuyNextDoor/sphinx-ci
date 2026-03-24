import { signIn } from "@/lib/auth-options";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0f0c1a" }}>
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <path d="M50 8L90 35V65L50 92L10 65V35L50 8Z" stroke="#c9a84c" strokeWidth="4" fill="#c9a84c" fillOpacity="0.1" />
              <circle cx="38" cy="45" r="5" fill="#c9a84c" />
              <circle cx="62" cy="45" r="5" fill="#c9a84c" />
              <path d="M35 62C35 62 42 70 50 70C58 70 65 62 65 62" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold" style={{ color: "#c9a84c" }}>
              sphinx-ci
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
          <p style={{ color: "#8b85a0" }}>
            Connecte-toi avec GitHub pour acceder a ton dashboard.
          </p>
        </div>

        <div
          className="rounded-xl p-6 border"
          style={{ background: "#1a1628", borderColor: "#252036" }}
        >
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Se connecter avec GitHub
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: "#5e5878" }}>
            En te connectant, tu autorises sphinx-ci a lire ton profil GitHub.
          </p>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: "#5e5878" }}>
          <Link href="/" className="hover:underline" style={{ color: "#8b85a0" }}>
            ← Retour a l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
