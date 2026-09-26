import { describe, it, expect } from 'vitest';
import { sortFoodsByUsage } from '../../src/lib/sort.js';

const foods = [
  { id: 'a', name: '珍奶', createdAt: 1 },
  { id: 'b', name: '啤酒', createdAt: 2 },
  { id: 'c', name: '洋芋片', createdAt: 3 },
  { id: 'd', name: '雞排', createdAt: 4 }
];
const e = (foodItemId, date, createdAt) => ({ foodItemId, date, createdAt });
const names = (list) => list.map((f) => f.name);

describe('常用品項排序', () => {
  it('近 30 天次數多的在前', () => {
    const intakes = [e('b', '2026-09-20', 10), e('b', '2026-09-21', 11), e('a', '2026-09-22', 12)];
    expect(names(sortFoodsByUsage(foods, intakes, '2026-09-26')).slice(0, 2)).toEqual(['啤酒', '珍奶']);
  });

  it('次數相同時，最後記錄較近的在前', () => {
    const intakes = [e('a', '2026-09-20', 10), e('c', '2026-09-21', 20)];
    expect(names(sortFoodsByUsage(foods, intakes, '2026-09-26')).slice(0, 2)).toEqual(['洋芋片', '珍奶']);
  });

  it('超過 30 天的紀錄不列入計算', () => {
    const intakes = [e('a', '2026-08-27', 1), e('a', '2026-08-27', 2), e('b', '2026-08-28', 3)];
    // 8/28 是 30 天內的第一天，8/27 已超出
    expect(names(sortFoodsByUsage(foods, intakes, '2026-09-26'))[0]).toBe('啤酒');
  });

  it('沒用過的品項排在後面，較新加入的在前', () => {
    const intakes = [e('a', '2026-09-25', 1)];
    expect(names(sortFoodsByUsage(foods, intakes, '2026-09-26'))).toEqual(['珍奶', '雞排', '洋芋片', '啤酒']);
  });

  it('不修改原陣列', () => {
    const copy = [...foods];
    sortFoodsByUsage(foods, [e('d', '2026-09-25', 1)], '2026-09-26');
    expect(foods).toEqual(copy);
  });
});
