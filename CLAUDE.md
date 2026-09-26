# healbuddy

- 產品想法：`IDEA.md`；計劃書：`docs/專案計劃書.md`
- `docs/` 是 Obsidian vault。每當做出新決策或修改既有決策，使用 `decision-entity` skill 在 `docs/entities/` 建立或更新實體筆記，並用 `[[wikilink]]` 串連、更新 `docs/決策索引.md`。
- 每項功能都要有自動化測試（見 `docs/entities/前端測試.md`）。

## 指令

- `npm run dev`：開發伺服器（http://localhost:5173/healbuddy/）
- `npm test`：單元 + 元件測試（Vitest）
- `npm run test:e2e`：端對端測試（Playwright，手機尺寸，會先 build）
- `npm run build`：建置到 `dist/`
- `npm run icons`：重新產生 App 圖示

## 結構

- `src/lib/`：純邏輯（日期、胖胖等級、排序、統計）與資料層（`db.js` IndexedDB、`store.svelte.js` App 狀態與所有操作）
- `src/components/`、`src/pages/`：介面
- `tests/unit/`：Vitest；`e2e/`：Playwright
- `.github/workflows/deploy.yml`：push 到 main → 測試 → 部署 GitHub Pages
