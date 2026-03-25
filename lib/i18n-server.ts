import { cookies } from "next/headers";
import type { Locale } from "./i18n";
import { getDictionary } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  return locale === "fr" ? "fr" : "en";
}

export { getDictionary };
export type { Locale };
