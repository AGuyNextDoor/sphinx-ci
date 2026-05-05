import Link from "next/link";
import { headers } from "next/headers";
import { getLocale, getDictionary } from "@/lib/i18n-server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { ComponentStatus, StatusResponse } from "@/app/api/status/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const copy = {
  en: {
    title: "Service status",
    subtitle: "Live health of sphinx-ci and its upstream dependencies.",
    overallOperational: "All systems operational",
    overallDegraded: "Some systems are degraded",
    overallDown: "Major outage",
    overallUnknown: "Status unknown",
    componentsTitle: "Components",
    statusLabel: "Status",
    componentLabel: "Component",
    latencyLabel: "Latency",
    checkedAt: "Last checked",
    rawJson: "Raw JSON",
    statusOperational: "Operational",
    statusDegraded: "Degraded",
    statusDown: "Down",
    statusUnknown: "Unknown",
    failOpenTitle: "Fail-open by design",
    failOpenBody:
      "If the hub or Anthropic API is unavailable, your PRs are not blocked. The GitHub Action exits cleanly and the workflow ends in success — your team keeps shipping.",
    upstreamTitle: "Upstream dependencies",
    upstreamBody:
      "Anthropic and GitHub statuses are pulled from their official statuspage feeds. Click through for the canonical history.",
    anthropicLink: "status.anthropic.com",
    githubLink: "githubstatus.com",
  },
  fr: {
    title: "Statut du service",
    subtitle: "État en direct de sphinx-ci et de ses dépendances.",
    overallOperational: "Tous les systèmes fonctionnent",
    overallDegraded: "Certains systèmes sont dégradés",
    overallDown: "Panne majeure",
    overallUnknown: "Statut inconnu",
    componentsTitle: "Composants",
    statusLabel: "État",
    componentLabel: "Composant",
    latencyLabel: "Latence",
    checkedAt: "Dernière vérification",
    rawJson: "JSON brut",
    statusOperational: "Opérationnel",
    statusDegraded: "Dégradé",
    statusDown: "Hors service",
    statusUnknown: "Inconnu",
    failOpenTitle: "Fail-open by design",
    failOpenBody:
      "Si le hub ou l'API Anthropic est indisponible, tes PRs ne sont pas bloquées. L'Action GitHub se termine proprement avec un succès — ton équipe continue de livrer.",
    upstreamTitle: "Dépendances",
    upstreamBody:
      "Les statuts Anthropic et GitHub viennent de leurs statuspages officielles. Clique pour l'historique de référence.",
    anthropicLink: "status.anthropic.com",
    githubLink: "githubstatus.com",
  },
};

const STATUS_COLORS: Record<ComponentStatus, { dot: string; text: string; bg: string }> = {
  operational: { dot: "#4ade80", text: "#4ade80", bg: "rgba(74, 222, 128, 0.1)" },
  degraded: { dot: "#fbbf24", text: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
  down: { dot: "#f87171", text: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },
  unknown: { dot: "#8b85a0", text: "#8b85a0", bg: "rgba(139, 133, 160, 0.1)" },
};

function statusLabel(status: ComponentStatus, c: (typeof copy)["en"]) {
  switch (status) {
    case "operational":
      return c.statusOperational;
    case "degraded":
      return c.statusDegraded;
    case "down":
      return c.statusDown;
    default:
      return c.statusUnknown;
  }
}

function overallLabel(status: ComponentStatus, c: (typeof copy)["en"]) {
  switch (status) {
    case "operational":
      return c.overallOperational;
    case "degraded":
      return c.overallDegraded;
    case "down":
      return c.overallDown;
    default:
      return c.overallUnknown;
  }
}

async function fetchStatus(): Promise<StatusResponse | null> {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (!host) return null;
  try {
    const res = await fetch(`${proto}://${host}/api/status`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as StatusResponse;
  } catch {
    return null;
  }
}

export const metadata = {
  title: "Status — sphinx-ci",
  description: "Live health of sphinx-ci and its upstream dependencies.",
};

export default async function StatusPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const c = copy[locale];
  const data = await fetchStatus();

  const overall = data?.overall ?? "unknown";
  const overallColor = STATUS_COLORS[overall];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
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
          <h1 className="text-4xl font-bold text-white text-center mb-3" style={{ fontFamily: "Georgia, serif" }}>
            {c.title}
          </h1>
          <p className="text-center mb-10" style={{ color: "#b0a8c4" }}>
            {c.subtitle}
          </p>

          {/* Overall banner */}
          <div
            className="rounded-xl p-6 border mb-8 flex items-center gap-4"
            style={{ background: overallColor.bg, borderColor: overallColor.dot }}
          >
            <span
              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: overallColor.dot, boxShadow: `0 0 12px ${overallColor.dot}` }}
              aria-hidden
            />
            <div className="flex-1">
              <p className="text-lg font-semibold" style={{ color: overallColor.text }}>
                {overallLabel(overall, c)}
              </p>
              {data?.checkedAt && (
                <p className="text-xs mt-1" style={{ color: "#8b85a0" }}>
                  {c.checkedAt}: {new Date(data.checkedAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
                </p>
              )}
            </div>
          </div>

          {/* Components */}
          <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
            {c.componentsTitle}
          </h2>
          <div className="rounded-xl border overflow-hidden mb-10" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <div className="grid grid-cols-[1fr_auto_auto] px-5 py-3 text-xs uppercase tracking-wider border-b" style={{ borderColor: "#252036", color: "#8b85a0" }}>
              <span>{c.componentLabel}</span>
              <span className="px-4">{c.latencyLabel}</span>
              <span>{c.statusLabel}</span>
            </div>
            {(data?.components ?? []).map((component) => {
              const colors = STATUS_COLORS[component.status];
              return (
                <div
                  key={component.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center px-5 py-4 border-b last:border-b-0"
                  style={{ borderColor: "#252036" }}
                >
                  <div>
                    <p className="text-white font-medium text-sm">{component.name}</p>
                    {component.detail && (
                      <p className="text-xs mt-1" style={{ color: "#8b85a0" }}>
                        {component.detail}
                      </p>
                    )}
                  </div>
                  <span className="px-4 text-xs" style={{ color: "#8b85a0", fontFamily: "monospace" }}>
                    {component.responseTimeMs !== null ? `${component.responseTimeMs}ms` : "—"}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: colors.dot }}
                      aria-hidden
                    />
                    <span className="text-xs font-medium" style={{ color: colors.text }}>
                      {statusLabel(component.status, c)}
                    </span>
                  </span>
                </div>
              );
            })}
            {!data && (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "#8b85a0" }}>
                {locale === "en" ? "Unable to fetch status." : "Impossible de récupérer le statut."}
              </div>
            )}
          </div>

          {/* Fail-open note */}
          <div className="rounded-xl p-5 border mb-6" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <h3 className="text-white font-semibold mb-2">{c.failOpenTitle}</h3>
            <p className="text-sm" style={{ color: "#b0a8c4" }}>
              {c.failOpenBody}
            </p>
          </div>

          {/* Upstream */}
          <div className="rounded-xl p-5 border mb-6" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <h3 className="text-white font-semibold mb-2">{c.upstreamTitle}</h3>
            <p className="text-sm mb-3" style={{ color: "#b0a8c4" }}>
              {c.upstreamBody}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="https://status.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#c9a84c" }}
              >
                {c.anthropicLink} →
              </a>
              <a
                href="https://www.githubstatus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#c9a84c" }}
              >
                {c.githubLink} →
              </a>
            </div>
          </div>

          {/* Raw JSON link */}
          <div className="text-center">
            <a
              href="/api/status"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: "#252036", color: "#b0a8c4" }}
            >
              {c.rawJson} →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
