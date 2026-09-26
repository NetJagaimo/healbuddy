import { test, expect, devices } from '@playwright/test';
import { open, tab } from './helpers.js';

const banner = (page) => page.getByRole('region', { name: '安裝 App' });

test('瀏覽器支援時可一鍵安裝', async ({ page }) => {
  await open(page);
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = async () => (window.__prompted = true);
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    dispatchEvent(e);
  });
  await banner(page).getByRole('button', { name: '一鍵安裝' }).click();
  expect(await page.evaluate(() => window.__prompted)).toBe(true);
  await expect(banner(page)).toHaveCount(0);
});

test('首頁的安裝提示關掉後不再出現，品項頁仍保留', async ({ page }) => {
  await open(page);
  await banner(page).getByRole('button', { name: '不再顯示安裝提示' }).click();
  await expect(banner(page)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: '9月26日（六）' })).toBeVisible();
  await expect(banner(page)).toHaveCount(0);
  await tab(page, '品項');
  await expect(banner(page)).toBeVisible();
});

test.describe('iPhone', () => {
  const { defaultBrowserType, ...iphone } = devices['iPhone 13'];
  test.use(iphone);

  test('顯示 Safari 加入主畫面的步驟', async ({ page }) => {
    await open(page);
    await expect(banner(page)).toContainText('加入主畫面');
    await expect(banner(page).getByRole('button', { name: '一鍵安裝' })).toHaveCount(0);
  });
});
