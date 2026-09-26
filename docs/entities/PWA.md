---
type: entity
status: 採用
date: 2026-09-26
updated: 2026-09-26
tags: [決策, 技術]
---

# PWA

## 決策
healbuddy 以 PWA（Progressive Web App）形式提供，使用者從瀏覽器打開網頁後「加入主畫面」即可像 App 一樣使用。

## 原因
希望能在手機上使用，但不想直接做一個原生 App（不需上架、不需維護 iOS/Android 兩套程式）。

## 範圍與限制
- 包含：Web App Manifest（名稱、圖示、主題色、`display: standalone`）、Service Worker 快取所有靜態資源。
- 不包含：推播通知、背景同步、App Store 上架（現階段）。

## 對實作的影響
- 需支援 iOS Safari 與 Android Chrome 的「加入主畫面」流程。
- Service Worker 必須在首次載入後讓 App 可完全離線運作，見 [[離線使用]]。
- 靜態資源路徑需配合 [[github.io架站]] 的子路徑（`/healbuddy/`）。
- 介面以手機直向為主要設計尺寸。

## 考慮過的替代方案
- 原生 App / React Native / Flutter — 開發與上架成本過高，不符需求。
- 純網頁（不可安裝）— 在手機上使用體驗較差，無法離線。

## 相關實體
- [[離線使用]] — PWA 的 Service Worker 是離線能力的基礎
- [[github.io架站]] — PWA 部署的位置；GitHub Pages 提供 HTTPS，符合 Service Worker 要求
- [[Svelte]] — 用來實作 PWA 的前端框架
- [[前端測試]] — 需驗證可安裝性（manifest）與離線行為
- [[PWA安裝提示]] — 教使用者安裝，支援時一鍵安裝

## 變更紀錄
- 2026-09-26 建立
- 2026-09-26 連結 [[PWA安裝提示]]
