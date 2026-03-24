import { auth, signOut } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top nav */}
      <nav className="border-b border-gray-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-white">
              sphinx-ci
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/repos"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Repos
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Quiz
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              )}
              <span className="text-sm text-gray-300">
                {session.user.githubLogin || session.user.name}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Deconnexion
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
