/**
 * Truncate a string to a maximum length, adding an ellipsis if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Format a date relative to now (e.g., "il y a 2h", "il y a 3j").
 */
export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "a l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD < 30) return `il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR");
}

/**
 * Generate a random hex string of the specified length.
 */
export function randomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check if a score passes the quiz threshold.
 */
export function isPassingScore(score: number, threshold: number = 70): boolean {
  return score >= threshold;
}
