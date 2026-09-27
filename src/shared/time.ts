const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2025-01" → Date at the start of that month. null means now.
export function monthDate(ym: string | null): Date {
  if (!ym) return new Date();
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function monthLabel(ym: string | null): string {
  if (!ym) return "now";
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function rangeLabel(start: string, end: string | null): string {
  return `${monthLabel(start)} – ${monthLabel(end)}`;
}

// Whole months, counting both ends, as "2y 3m".
export function durationLabel(start: string, end: string | null): string {
  const a = monthDate(start);
  const b = monthDate(end);
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (!y) return `${m}m`;
  return m ? `${y}y ${m}m` : `${y}y`;
}

// Fractional year, for placing spans on a time axis.
export function yearValue(ym: string | null): number {
  const d = monthDate(ym);
  return d.getFullYear() + d.getMonth() / 12 + (ym ? 0 : d.getDate() / 365);
}
