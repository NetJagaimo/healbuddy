import { it, expect } from 'vitest';
import { fatLevel } from '../../src/lib/level.js';

it.each([
  [0, ''],
  [1, '🐹'],
  [2, '🐹'],
  [3, '🐷'],
  [4, '🐷'],
  [5, '🦛'],
  [12, '🦛']
])('%i 樣 → %s', (count, emoji) => {
  expect(fatLevel(count)).toBe(emoji);
});
