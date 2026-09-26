import { describe, it, expect } from 'vitest';
import { daySummary, rangeSummary } from '../../src/lib/stats.js';
import { weekDays } from '../../src/lib/date.js';

const intakes = [
  { id: 1, date: '2026-09-21', name: '珍奶', createdAt: 1 },
  { id: 2, date: '2026-09-21', name: '雞排', createdAt: 2 },
  { id: 3, date: '2026-09-21', name: '珍奶', createdAt: 3 },
  { id: 4, date: '2026-09-24', name: '啤酒', createdAt: 4 },
  { id: 5, date: '2026-09-28', name: '珍奶', createdAt: 5 }
];
const checks = [
  { id: 'x', date: '2026-09-21', name: '健身房', emoji: '🏋', createdAt: 1 },
  { id: 'y', date: '2026-09-21', name: '走路 8000 步', emoji: '🚶', createdAt: 2 },
  { id: 'z', date: '2026-09-23', name: '健身房', emoji: '🏋', createdAt: 3 }
];

describe('統計', () => {
  it('單日：胖胖等級與運動 emoji 並列', () => {
    const s = daySummary('2026-09-21', intakes, checks);
    expect(s.intakes.map((e) => e.name)).toEqual(['珍奶', '雞排', '珍奶']);
    expect(s.level).toBe('🐷');
    expect(s.emojis).toBe('🏋🚶');
  });

  it('沒有紀錄的日子', () => {
    const s = daySummary('2026-09-22', intakes, checks);
    expect(s.level).toBe('');
    expect(s.emojis).toBe('');
  });

  it('本週：樣數、運動天數、最常吃', () => {
    const s = rangeSummary(weekDays('2026-09-24'), intakes, checks);
    expect(s.intakeCount).toBe(4); // 9/28 不在本週
    expect(s.exerciseDays).toBe(2); // 同一天兩項只算一天
    expect(s.topFoods[0]).toEqual({ name: '珍奶', count: 2 });
    expect(s.topExercises[0]).toEqual({ name: '🏋 健身房', count: 2 });
  });
});
