import { expect } from '@playwright/test';

// 固定在 2026-09-26（六）15:20，計時器照常運作
export const NOW = new Date('2026-09-26T15:20:00+08:00');

export async function open(page, hash = '') {
  await page.clock.setFixedTime(NOW);
  await page.goto(`./${hash}`);
  await expect(page.getByRole('navigation', { name: '主選單' })).toBeVisible();
}

export function tab(page, name) {
  return page.getByRole('navigation', { name: '主選單' }).getByRole('button', { name }).click();
}

export async function addFoods(page, names) {
  await tab(page, '品項');
  for (const name of names) {
    await page.getByLabel('新品項名稱').fill(name);
    await page.getByRole('button', { name: '新增' }).first().click();
    await expect(page.getByRole('region', { name: '食物品項' }).getByText(name, { exact: true })).toBeVisible();
  }
  await tab(page, '今日');
}

export const foodsRegion = (page) => page.getByRole('region', { name: '吃了什麼' });
export const todayList = (page) => page.getByRole('list', { name: '今日紀錄' });
