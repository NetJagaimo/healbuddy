import { test, expect } from '@playwright/test';
import { open, addFoods, foodsRegion, todayList } from './helpers.js';

test('manifest 可安裝設定正確', async ({ request }) => {
  const res = await request.get('manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m.display).toBe('standalone');
  expect(m.start_url).toBe('/healbuddy/');
  expect(m.icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
});

test('安裝後可完全離線使用', async ({ page, context }) => {
  await open(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await addFoods(page, ['珍奶']);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '9月26日（六）' })).toBeVisible();
  await foodsRegion(page).getByRole('button', { name: '珍奶' }).click();
  await expect(todayList(page)).toContainText('珍奶');
  await context.setOffline(false);
});
