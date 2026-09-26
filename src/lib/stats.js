import { fatLevel } from './level.js';

export function intakesOn(date, intakes) {
  return intakes
    .filter((e) => e.date === date)
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
}

export function checksOn(date, checks) {
  return checks.filter((c) => c.date === date).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
}

export function daySummary(date, intakes, checks) {
  const dayIntakes = intakesOn(date, intakes);
  const dayChecks = checksOn(date, checks);
  return {
    date,
    intakes: dayIntakes,
    checks: dayChecks,
    level: fatLevel(dayIntakes.length),
    emojis: dayChecks.map((c) => c.emoji).join('')
  };
}

function rank(names) {
  const counts = new Map();
  for (const n of names) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** 一段期間（本週 / 本月）的統計 */
export function rangeSummary(dates, intakes, checks) {
  const set = new Set(dates);
  const inRange = intakes.filter((e) => set.has(e.date));
  const checksInRange = checks.filter((c) => set.has(c.date));
  return {
    intakeCount: inRange.length,
    exerciseDays: new Set(checksInRange.map((c) => c.date)).size,
    topFoods: rank(inRange.map((e) => e.name)),
    topExercises: rank(checksInRange.map((c) => `${c.emoji} ${c.name}`))
  };
}
