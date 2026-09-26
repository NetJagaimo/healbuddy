import { test, expect } from '@playwright/test';
import { open, tab, addFoods, foodsRegion } from './helpers.js';

async function seed(page) {
  await open(page);
  await addFoods(page, ['珍奶', '啤酒', '雞排']);
  for (const name of ['珍奶', '啤酒', '雞排']) await foodsRegion(page).getByRole('button', { name }).click();
  await page.getByRole('button', { name: '🏊 游泳' }).click();
  await tab(page, '紀錄');
}

test('今日檢視顯示胖胖等級、運動 emoji 與紀錄', async ({ page }) => {
  await seed(page);
  await expect(page.getByRole('heading', { name: '9月26日（六）' })).toBeVisible();
  await expect(page.getByLabel('當日狀態')).toHaveText('🐷 🏊');
  await expect(page.getByRole('list', { name: '多吃' }).getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('list', { name: '運動' })).toContainText('游泳');
  await expect(page.getByRole('button', { name: '下一段' })).toBeDisabled();
});

test('補登過去的日期，並刪除後復原', async ({ page }) => {
  await seed(page);
  await page.getByRole('button', { name: '上一段' }).click();
  await page.getByRole('button', { name: '上一段' }).click();
  await expect(page.getByRole('heading', { name: '9月24日（四）' })).toBeVisible();

  await page.getByRole('button', { name: '＋ 補登這一天' }).click();
  const sheet = page.getByRole('dialog', { name: '補登 9月24日（四）' });
  await sheet.getByRole('button', { name: '珍奶' }).click();
  await sheet.getByRole('button', { name: '🏋 健身房' }).click();
  await sheet.getByRole('button', { name: '關閉' }).click();

  await expect(page.getByLabel('當日狀態')).toHaveText('🐹 🏋');
  const list = page.getByRole('list', { name: '多吃' });
  await expect(list).toContainText('珍奶');
  await expect(list).not.toContainText(':'); // 補登不記時間

  await page.getByRole('button', { name: '刪除 珍奶' }).click();
  await expect(page.getByLabel('當日狀態')).toHaveText('🏋');
  await page.getByRole('button', { name: '復原' }).click();
  await expect(page.getByLabel('當日狀態')).toHaveText('🐹 🏋');
});

test('本週檢視列出每天的品項與運動，點一天可進入', async ({ page }) => {
  await seed(page);
  await page.getByRole('tab', { name: '本週' }).click();
  await expect(page.getByRole('heading', { name: '9/20 – 9/26' })).toBeVisible();
  const sat = page.getByRole('button', { name: '9/26 紀錄' });
  await expect(sat).toContainText('🐷');
  await expect(sat).toContainText('珍奶 啤酒 雞排');
  await expect(sat).toContainText('🏊');
  await expect(page.getByText('多吃 3 樣 · 運動 1 天')).toBeVisible();

  await page.getByRole('button', { name: '9/22 紀錄' }).click();
  await expect(page.getByRole('heading', { name: '9月22日（二）' })).toBeVisible();
});

test('本月檢視以月曆顯示，未來的日子不能點', async ({ page }) => {
  await seed(page);
  await page.getByRole('tab', { name: '本月' }).click();
  await expect(page.getByRole('heading', { name: '2026年9月' })).toBeVisible();
  await expect(page.getByRole('button', { name: '9/26 紀錄' })).toContainText('🐷');
  await expect(page.getByRole('button', { name: '9/27 紀錄' })).toBeDisabled();
  await expect(page.getByText('最常做：🏊 游泳 ×1')).toBeVisible();

  await page.getByRole('button', { name: '上一段' }).click();
  await expect(page.getByRole('heading', { name: '2026年8月' })).toBeVisible();
  await expect(page.getByText('多吃 0 樣 · 運動 0 天')).toBeVisible();
});
