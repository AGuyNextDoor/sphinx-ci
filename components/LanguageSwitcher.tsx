"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function LanguageSwitcher({ locale }: { locale: "en" | "fr" }) {
  const router = useRouter();

  const switchLocale = useCallback(() => {
    const newLocale = locale === "en" ? "fr" : "en";
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;

    // Fade out, refresh, fade back in
    document.body.style.transition = "opacity 0.15s ease";
    document.body.style.opacity = "0";
    setTimeout(() => {
      router.refresh();
      // Fade back in after refresh
      requestAnimationFrame(() => {
        document.body.style.opacity = "1";
      });
    }, 150);
  }, [locale, router]);

  return (
    <button
      onClick={switchLocale}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-colors"
      style={{ borderColor: "#252036", color: "#b0a8c4" }}
      title={locale === "en" ? "Passer en français" : "Switch to English"}
    >
      <span className="text-sm leading-none">{locale === "en" ? "🇫🇷" : "🇬🇧"}</span>
      {locale === "en" ? "FR" : "EN"}
    </button>
  );
}
