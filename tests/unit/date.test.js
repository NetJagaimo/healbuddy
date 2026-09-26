import { describe, it, expect } from 'vitest';
import { toISO, todayISO, addDays, weekDays, monthGrid, addMonths, formatDay, timeHM } from '../../src/lib/date.js';

describe('date', () => {
  it('以本地時間 00:00 換日', () => {
    expect(todayISO(new Date(2026, 8, 26, 23, 59))).toBe('2026-09-26');
    expect(todayISO(new Date(2026, 8, 27, 0, 0))).toBe('2026-09-27');
  });

  it('addDays 跨月、跨年', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('一週從星期日開始', () => {
    expect(weekDays('2026-09-26')).toEqual([
      '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'
    ]);
    expect(weekDays('2026-09-27')[0]).toBe('2026-09-27');
  });

  it('月曆格前後以 null 補齊', () => {
    const grid = monthGrid('2026-09-15');
    expect(grid[0].slice(0, 3)).toEqual([null, null, '2026-09-01']); // 9/1 是星期二
    expect(grid.flat().filter(Boolean)).toHaveLength(30);
    expect(grid.every((row) => row.length === 7)).toBe(true);
  });

  it('addMonths 回到該月 1 號', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-01');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-01');
  });

  it('格式化', () => {
    expect(formatDay('2026-09-26')).toBe('9月26日（六）');
    expect(timeHM(new Date(2026, 0, 1, 9, 5))).toBe('09:05');
    expect(toISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
