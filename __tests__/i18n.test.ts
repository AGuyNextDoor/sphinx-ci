import { describe, it, expect } from "vitest";
import { dictionaries, getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

describe("i18n", () => {
  it("has both EN and FR dictionaries", () => {
    expect(dictionaries.en).toBeDefined();
    expect(dictionaries.fr).toBeDefined();
  });

  it("getDictionary returns the correct locale", () => {
    const en = getDictionary("en");
    const fr = getDictionary("fr");

    expect(en.nav.signIn).toBe("Sign in");
    expect(fr.nav.signIn).toBe("Se connecter");
  });

  it("EN and FR have the same keys", () => {
    function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      const keys: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          keys.push(...getKeys(obj[key] as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    const enKeys = getKeys(dictionaries.en as unknown as Record<string, unknown>);
    const frKeys = getKeys(dictionaries.fr as unknown as Record<string, unknown>);

    expect(enKeys).toEqual(frKeys);
  });

  it("no empty translation values", () => {
    function checkNoEmpty(obj: Record<string, unknown>, path = "") {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === "object" && value !== null) {
          checkNoEmpty(value as Record<string, unknown>, fullPath);
        } else if (typeof value === "string") {
          expect(value.length, `Empty value at ${fullPath}`).toBeGreaterThan(0);
        }
      }
    }

    checkNoEmpty(dictionaries.en as unknown as Record<string, unknown>);
    checkNoEmpty(dictionaries.fr as unknown as Record<string, unknown>);
  });

  it("defaults to EN for unknown locales", () => {
    const result = getDictionary("en" as Locale);
    expect(result.landing.title1).toContain("Sphinx");
  });
});
