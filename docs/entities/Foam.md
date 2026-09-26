---
type: entity
status: 採用
date: 2026-09-26
updated: 2026-09-26
tags: [決策, 流程]
---

# Foam

## 決策
在 VS Code 中使用 Foam 擴充套件（`foam.foam-vscode`）瀏覽與編輯 `docs/` 的決策筆記，並在 `.vscode/extensions.json` 將它列為推薦擴充套件。

## 原因
希望在 VS Code 裡也能像 Obsidian 一樣使用 `[[wikilink]]`：點擊跳轉、自動補全、反向連結與關係圖。

## 範圍與限制
- Foam 只是編輯輔助工具；筆記格式仍以 Obsidian 相容的 `[[wikilink]]` 為準，Obsidian 與 VS Code 可同時使用。
- 不包含：Foam 的日誌、模板等其他功能（現階段不使用）。

## 對實作的影響
- `.vscode/extensions.json` 推薦安裝 Foam，打開專案時 VS Code 會提示。
- 筆記檔名必須在整個 vault 中唯一，因為 `[[名稱]]` 依檔名解析。

## 考慮過的替代方案
- Markdown Memo / Markdown Notes — 較輕量，但反向連結與關係圖不如 Foam 完整。
- 改用標準 `[文字](路徑.md)` 連結 — VS Code 內建支援，但失去 Obsidian 的 wikilink 體驗。

## 相關實體
- 決策筆記總覽見 [[決策索引]]

## 變更紀錄
- 2026-09-26 建立
