/**
 * Format gold values for display.
 * Shows "1.2M" for millions, "1.5B" for billions, etc.
 */
export function formatGold(amount) {
  if (amount == null || isNaN(amount)) return "0";
  const num = Number(amount);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 10_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString();
}
