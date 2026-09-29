import { test, expect } from '@playwright/test';
import { open, tab, addFoods, foodsRegion, todayList } from './helpers.js';
import { readFile } from 'node:fs/promises';

test('品項改名與刪除，舊紀錄不受影響', async ({ page }) => {
  await open(page);
  await addFoods(page, ['珍奶']);
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();

  await tab(page, '品項');
  await page.getByRole('button', { name: '編輯 珍奶' }).click();
  await page.getByLabel('品項名稱', { exact: true }).fill('珍珠奶茶');
  await page.getByRole('button', { name: '儲存' }).click();
  await expect(page.getByRole('region', { name: '食物品項' })).toContainText('珍珠奶茶');

  await page.getByRole('button', { name: '刪除品項 珍珠奶茶' }).click();
  await expect(page.getByRole('region', { name: '食物品項' })).not.toContainText('珍珠奶茶');

  await tab(page, '今日');
  await expect(todayList(page)).toContainText('珍奶');
});

test('重複的品項名稱會顯示錯誤', async ({ page }) => {
  await open(page);
  await addFoods(page, ['珍奶']);
  await tab(page, '品項');
  await page.getByLabel('新品項名稱').fill('珍奶');
  await page.getByRole('button', { name: '新增' }).first().click();
  await expect(page.getByRole('alert')).toHaveText('已經有這個名稱了');
});

test('新增、修改運動項目後出現在首頁', async ({ page }) => {
  await open(page);
  await tab(page, '品項');
  await page.getByLabel('新運動 emoji').fill('🚴');
  await page.getByLabel('新運動名稱').fill('騎車');
  await page.getByRole('region', { name: '運動項目' }).getByRole('button', { name: '新增' }).click();

  await page.getByRole('button', { name: '編輯 游泳' }).click();
  await page.getByLabel('運動 emoji', { exact: true }).fill('🤽');
  await page.getByLabel('運動名稱', { exact: true }).fill('水中運動');
  await page.getByRole('button', { name: '儲存' }).click();

  await tab(page, '今日');
  await expect(page.getByRole('button', { name: '🚴 騎車' })).toBeVisible();
  await expect(page.getByRole('button', { name: '🤽 水中運動' })).toBeVisible();
});

test('窄螢幕上編輯運動時，儲存與取消按鈕都在畫面內', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page, '#/items');
  await page.getByRole('button', { name: '編輯 游泳' }).click();
  for (const name of ['儲存', '取消']) {
    const box = await page.getByRole('button', { name, exact: true }).boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(360);
  }
  await page.getByLabel('運動名稱', { exact: true }).fill('自由式');
  await page.getByRole('button', { name: '儲存' }).click();
  await expect(page.getByRole('region', { name: '運動項目' })).toContainText('自由式');
});

test('匯出備份後可在新裝置匯入', async ({ page, browser }) => {
  await open(page);
  await addFoods(page, ['珍奶']);
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await tab(page, '品項');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '匯出備份' }).click()
  ]);
  expect(download.suggestedFilename()).toBe('healbuddy-2026-09-26.json');
  const path = await download.path();
  expect(JSON.parse(await readFile(path, 'utf8')).intakes).toHaveLength(1);

  // 全新的瀏覽器環境 = 新手機
  const context = await browser.newContext({ timezoneId: 'Asia/Taipei' });
  const fresh = await context.newPage();
  await open(fresh, '#/items');
  fresh.once('dialog', (d) => d.accept());
  await fresh.getByLabel('選擇備份檔').setInputFiles(path);
  await expect(fresh.getByRole('region', { name: '食物品項' })).toContainText('珍奶');
  await tab(fresh, '今日');
  await expect(todayList(fresh)).toContainText('珍奶');
  await context.close();
});
