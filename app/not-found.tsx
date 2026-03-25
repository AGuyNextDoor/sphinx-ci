import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0f0c1a" }}>
      <div className="max-w-md text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sphinx-logo.svg" alt="" width="48" height="48" className="mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-4" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
          404
        </h1>
        <p className="text-xl text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
          The Sphinx found nothing here
        </p>
        <p className="mb-8" style={{ color: "#b0a8c4" }}>
          This page doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "#c9a84c", color: "#0f0c1a" }}
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm transition-colors"
            style={{ color: "#b0a8c4" }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
