import { test, expect } from '@playwright/test';
import { open, tab, addFoods, foodsRegion, todayList } from './helpers.js';

test('首頁顯示今天日期、分頁順序為 今日 → 紀錄 → 品項', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('heading', { name: '9月26日（六）' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主選單' }).getByRole('button')).toHaveText(['今日', '紀錄', '品項']);
});

test('新增品項後在首頁一鍵記錄，重新整理後仍在', async ({ page }) => {
  await open(page);
  await addFoods(page, ['珍奶', '啤酒']);
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await expect(page.getByRole('status')).toContainText('已記錄 珍奶');
  await expect(todayList(page)).toContainText('珍奶');
  await expect(todayList(page)).toContainText('15:20');

  await page.reload();
  await expect(todayList(page)).toContainText('珍奶');
});

test('記錄後可以按復原', async ({ page }) => {
  await open(page);
  await addFoods(page, ['珍奶']);
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await page.getByRole('button', { name: '復原' }).click();
  await expect(page.getByText('今天還沒有紀錄')).toBeVisible();
});

test('刪除今日紀錄後可以復原', async ({ page }) => {
  await open(page);
  await addFoods(page, ['珍奶']);
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await page.getByRole('button', { name: '刪除 珍奶' }).click();
  await expect(page.getByRole('status')).toContainText('已刪除 珍奶');
  await expect(page.getByText('今天還沒有紀錄')).toBeVisible();
  await page.getByRole('button', { name: '復原' }).click();
  await expect(todayList(page)).toContainText('珍奶');
});

test('同一天可打卡多項運動，再按一次取消', async ({ page }) => {
  await open(page);
  const gym = page.getByRole('button', { name: '🏋 健身房' });
  const walk = page.getByRole('button', { name: '🚶 走路 8000 步' });
  await gym.click();
  await walk.click();
  await expect(gym).toHaveAttribute('aria-pressed', 'true');
  await expect(walk).toHaveAttribute('aria-pressed', 'true');
  await expect(todayList(page)).toContainText('健身房');
  await expect(todayList(page)).toContainText('走路 8000 步');

  await gym.click();
  await expect(gym).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('status')).toContainText('已取消 🏋 健身房');
});

test('品項超過 8 個時，其餘收在「更多」', async ({ page }) => {
  await open(page);
  const names = ['珍奶', '啤酒', '洋芋片', '雞排', '鹹酥雞', '可樂', '蛋糕', '餅乾', '冰淇淋', '泡麵'];
  await addFoods(page, names);
  const chips = foodsRegion(page).getByRole('button');
  await expect(chips).toHaveCount(9); // 8 個品項 + 更多
  await foodsRegion(page).getByRole('button', { name: /更多/ }).click();
  await expect(chips).toHaveCount(11);
});

test('常用的品項排在前面', async ({ page }) => {
  await open(page);
  await addFoods(page, ['珍奶', '啤酒', '洋芋片']);
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await foodsRegion(page).getByRole('button', { name: '洋芋片' }).click();
  await expect(page.getByRole('status')).toContainText('已記錄 洋芋片'); // 寫入完成才會出現
  await page.reload();
  await expect(foodsRegion(page).getByRole('button')).toHaveText(['珍奶', '洋芋片', '啤酒']);
});
