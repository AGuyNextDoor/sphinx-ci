import { auth, signOut } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen" style={{ background: "#0f0c1a" }}>
      {/* Top nav */}
      <nav className="border-b px-6 py-3" style={{ borderColor: "#252036" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/sphinx-logo.svg" alt="" width="24" height="24" />
              <span className="hidden sm:inline text-lg font-bold" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
                sphinx-ci
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <Link href="/dashboard" className="transition-colors hover:text-white" style={{ color: "#b0a8c4" }}>
                {t.nav.dashboard}
              </Link>
              <Link href="/dashboard/repos" className="transition-colors hover:text-white" style={{ color: "#b0a8c4" }}>
                {t.nav.repos}
              </Link>
              <Link href="/dashboard/quizzes" className="transition-colors hover:text-white" style={{ color: "#b0a8c4" }}>
                {t.nav.quizzes}
              </Link>
              <Link href="/dashboard/analytics" className="transition-colors hover:text-white" style={{ color: "#b0a8c4" }}>
                {t.analytics.title}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="hidden sm:inline text-sm" style={{ color: "#b0a8c4" }}>
                {session.user.githubLogin || session.user.name}
              </span>
            </div>
            <LanguageSwitcher locale={locale} />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm transition-colors"
                style={{ color: "#8b85a0" }}
              >
                {t.nav.signOut}
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
