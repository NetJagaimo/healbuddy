import { addDays } from './date.js';

export const HOME_FOOD_LIMIT = 8;

/**
 * 常用品項排序（見 docs/entities/常用品項排序.md）：
 * 近 30 天記錄次數多的在前，同次數以最後記錄時間較近者優先；
 * 沒用過的排在後面，較新加入的在前。
 */
export function sortFoodsByUsage(foods, intakes, today) {
  const from = addDays(today, -29);
  const usage = new Map();
  for (const e of intakes) {
    if (e.date < from || e.date > today) continue;
    const u = usage.get(e.foodItemId) ?? { count: 0, last: 0 };
    u.count += 1;
    u.last = Math.max(u.last, e.createdAt ?? 0);
    usage.set(e.foodItemId, u);
  }
  const none = { count: 0, last: 0 };
  return [...foods].sort((a, b) => {
    const ua = usage.get(a.id) ?? none;
    const ub = usage.get(b.id) ?? none;
    if (ua.count !== ub.count) return ub.count - ua.count;
    if (ua.last !== ub.last) return ub.last - ua.last;
    return (b.createdAt ?? 0) - (a.createdAt ?? 0);
  });
}
