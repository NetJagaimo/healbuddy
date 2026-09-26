// 用 Playwright 的 Chromium 把圖示畫成 PNG：npm run icons
import { chromium } from '@playwright/test';

const html = (size, radius) => `<!doctype html><html><body style="margin:0">
<div style="width:${size}px;height:${size}px;background:#f2a65a;border-radius:${radius}px;
display:flex;align-items:center;justify-content:center;font-size:${size * 0.6}px;line-height:1">🐹</div>
</body></html>`;

const targets = [
  ['public/icon-192.png', 192, 0],
  ['public/icon-512.png', 512, 0],
  ['public/apple-touch-icon.png', 180, 0]
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [path, size, radius] of targets) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html(size, radius));
  await page.screenshot({ path, omitBackground: true });
}
await browser.close();
console.log('icons written');
