---
description: Deploy this project to Vercel and report the live URL
---

Deploy this repository to Vercel and give the user the resulting URL.

### 背景說明 (Context)

- 本專案是 **Vite/React** 前端，後端為 **Express** + **`node:sqlite`** API（位於 `server/`），已透過 `vercel.json` 設定好 **Vercel** 部署（前端使用 `@vercel/static-build`，`server/index.js` 使用 `@vercel/node`，`/api/*` 路由到該 function）。
- Vercel 的 serverless function 除了 `/tmp` 以外皆為 **唯讀檔案系統**，且 `/tmp` **不會跨呼叫或冷啟動保留資料**，因此 SQLite 儲存的帳號/session/分數在此部署方式下僅為 **demo 用途**，隨時可能被重置。
- 除非使用者要求，否則 **不要** 為了「修好」這個限制而自行加上 **hosted database**；那是更大範圍的獨立變更。

### 前置作業 (Prerequisites)

- [ ] 確認 **Vercel CLI** 是否已安裝：
  ```bash
  vercel --version
  ```
  若未安裝，後續步驟改用 **`npx vercel`**，不需要全域安裝。
- [ ] 確認登入狀態：
  ```bash
  vercel whoami
  ```
  若尚未登入，請使用者自行執行 **`vercel login`**（需要互動式瀏覽器/信箱驗證，無法代替使用者完成），並在使用者確認已登入後才 **停下來等待確認**，再繼續下一步。

### 執行步驟 (Execution)

1. 於 repo 根目錄執行正式環境部署：
   ```bash
   vercel --prod --yes
   ```
   - 第一次執行時會一併 **連結專案 (link the project)**；採用合理的預設值即可，若遇到不明確的選擇則詢問使用者。

### 驗證方式 (Verification)

- 確認終端機輸出中包含部署完成後的 **production URL**。
- 向使用者回報：
  - Vercel 印出的 **production URL**。
  - 一行提醒：此部署上的 **簽名/登入/分數資料不具持久性**（serverless 檔案系統是暫時性的）－ **訪客模式 (guest mode) 不受影響**。
