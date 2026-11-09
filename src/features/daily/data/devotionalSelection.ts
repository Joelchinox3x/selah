export interface DevotionalSelection {
  dateKey: string;
  seen: number[];
  history: number[];
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getDayOfYear(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const currentUtc = Date.UTC(year, month, day);
  const startUtc = Date.UTC(year, 0, 1);
  const diffDays = Math.floor((currentUtc - startUtc) / 86400000);
  let dayOfYear = diffDays + 1;
  if (dayOfYear > 365) dayOfYear = 365;
  if (dayOfYear < 1) dayOfYear = 1;
  return dayOfYear;
}

export function selectDevotional(
  saved: DevotionalSelection | null,
  ids: readonly number[],
  date: Date,
  action: 'current' | 'random' | 'previous' = 'current',
  random: () => number = Math.random,
): DevotionalSelection {
  if (!ids.length) throw new Error('El catálogo de versículos está vacío');
  const dateKey = localDateKey(date);
  const validIds = new Set(ids);
  const seen = [...new Set((saved?.seen ?? []).filter((id) => validIds.has(id)))];
  // Deterministic 365-day calendar mapping: Day 1 (Jan 1) -> index 0, Day 365 (Dec 31) -> index 364
  const dayOfYear = getDayOfYear(date);
  const principal = ids[(dayOfYear - 1) % ids.length];
  let history = saved?.dateKey === dateKey
    ? saved.history.filter((id) => validIds.has(id)) : [];
  if (!history.length) history = [principal];
  const displayed = history[history.length - 1];
  if (!seen.includes(displayed)) seen.push(displayed);
  if (action === 'previous' && history.length > 1) history = history.slice(0, -1);
  if (action === 'random') {
    const current = history[history.length - 1];
    let available = ids.filter((id) => !seen.includes(id));
    if (!available.length) {
      seen.length = 0;
      seen.push(current);
      available = ids.filter((id) => id !== current);
    }
    if (available.length) {
      const next = available[Math.floor(random() * available.length)];
      seen.push(next);
      history = [...history, next];
    }
  }
  return { dateKey, seen, history };
}

export function parseDevotionalSelection(raw: string | null): DevotionalSelection | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (typeof value?.dateKey !== 'string' || !Array.isArray(value.seen) || !Array.isArray(value.history)) return null;
    if (![...value.seen, ...value.history].every((id) => Number.isInteger(id))) return null;
    return value;
  } catch { return null; }
}
