---
type: entity
status: 採用
date: 2026-09-26
updated: 2026-09-26
tags: [決策, 部署]
---

# github.io架站

## 決策
使用 GitHub Pages，部署在 `https://netjagaimo.github.io/healbuddy/`（repo：`NetJagaimo/healbuddy`，公開）。

## 原因
未來統一使用 github.io 進行網頁部署：免費、提供 HTTPS、與程式碼放在同一個地方。

## 範圍與限制
- 只能託管靜態檔案，沒有伺服器端邏輯——正好符合 [[離線使用]] 不需後端的決定。
- 網址為子路徑 `/healbuddy/`，建置時需設定 base path。
- 與使用者的部落格（`netjagaimo.github.io` 根目錄）共用網域，但是不同 repo，互不影響；使用者知情後選擇維持此做法。部落格不可再使用 `/healbuddy/` 路徑。

## 對實作的影響
- 使用 GitHub Actions：push 到 `main` → 跑 [[前端測試]] → 全部通過才建置並部署到 Pages。
- Vite `base` 設為 `/healbuddy/`；PWA manifest 的 `start_url`、`scope` 與 Service Worker 範圍同步設定。
- 使用 hash 路由或單頁設計，避免 GitHub Pages 對深層路徑回傳 404。

## 考慮過的替代方案
- Vercel / Netlify / Cloudflare Pages — 功能更多，但目前不需要，選擇較單純的 GitHub Pages。
- 另建 GitHub 組織（獨立網域 `<org>.github.io`）— 可與部落格完全分開，但使用者選擇維持子路徑。
- 自訂網域 — 需額外 DNS 設定，現階段不需要。

## 相關實體
- [[PWA]] — 部署對象；GitHub Pages 的 HTTPS 是 Service Worker 的前提
- [[離線使用]] — 無後端需求，使純靜態託管可行
- [[前端測試]] — 部署流程的前置關卡
- [[Svelte]] — 建置產物為靜態檔案

## 變更紀錄
- 2026-09-26 建立
- 2026-09-26 確定網址為 netjagaimo.github.io/healbuddy/（與部落格共用網域，使用者同意）
