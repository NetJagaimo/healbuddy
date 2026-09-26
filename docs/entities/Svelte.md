---
type: entity
status: 採用
date: 2026-09-26
updated: 2026-09-26
tags: [決策, 技術]
---

# Svelte

## 決策
前端框架使用 Svelte（見 IDEA.md）。

## 原因
IDEA.md 中指定。（詳細動機待補充）

## 範圍與限制
- 實際採用：Svelte 5（runes）+ Vite + `vite-plugin-pwa`（generateSW），純靜態單頁應用；不使用 SvelteKit。
- 資料層：`idb`（IndexedDB 的輕量封裝），資料量小，啟動時全部載入記憶體。
- 分頁以 hash 路由（`#/today`、`#/records`、`#/items`）切換。

## 對實作的影響
- 建置產物為純靜態檔，可直接部署到 [[github.io架站]]。
- 元件測試使用 @testing-library/svelte，見 [[前端測試]]。

## 考慮過的替代方案
- SvelteKit（adapter-static）— 可行，但此 App 頁面少，路由需求低，Vite 單頁較簡單。

## 相關實體
- [[PWA]] — Svelte 用於實作此 PWA
- [[github.io架站]] — 靜態建置產物的部署目標
- [[前端測試]] — 決定元件測試工具

## 變更紀錄
- 2026-09-26 建立（原因待使用者補充）
- 2026-09-26 實作完成，確認技術組合
