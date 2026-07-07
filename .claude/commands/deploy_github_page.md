---
description: Deploy this project's frontend to GitHub Pages and report the live URL
---

Deploy this repository's frontend to GitHub Pages and give the user the resulting URL.

### 背景說明 (Context)

- 本專案是 **Vite/React** 前端，後端為 **Express** + **`node:sqlite`** API（位於 `server/`）。GitHub Pages 只能提供 **靜態檔案**，無法執行 Express API。
- 部署在此環境代表 **僅有訪客模式 (guest mode only)**：signup/signin/分數保存 **不會運作**，因為沒有伺服器行程可回應 `/api/*`。**不要** 用 client-side 的方式繞過這個限制；那是更大範圍的獨立變更。如果使用者需要能運作的登入/分數功能，請改用 **`/deploy_vercel`**。
- GitHub Pages 的 **project site** 是從 `https://<user>.github.io/<repo>/` 提供服務，因此 Vite 需要在 `vite.config.ts` 設定 `base: '/<repo>/'`，否則建置後的資源網址會 404。若部署對象是 **user/org root page**（`<user>.github.io`）或使用 **自訂網域**，則可略過此設定。
- 請重新檢查而非直接沿用舊假設：上次檢查時，本 repo **尚無 git 歷史紀錄**、**尚未設定 GitHub remote**，且此環境 **未安裝 `gh` CLI**。這些狀態可能已經改變，執行前務必用 `git status`、`git remote -v`、`gh --version` 重新確認。
- 使用 **`gh-pages`** 這個 npm 套件將建置好的 `build/` 目錄發佈到 `gh-pages` 分支 — 比手動 subtree push 更簡單也更安全。

### 前置作業 (Prerequisites)

- [ ] 執行 `git status`，確認目前 repo 狀態。
  - 若尚未是 git repo，執行 `git init` 並將現有工作目錄做一次初始 commit。務必遵守既有的 `.gitignore`（不要強制加入被忽略的路徑，例如 `node_modules/`、`build/`、`.vercel/`、`server/data/`）。
- [ ] 執行 `git remote -v`，確認是否已有 **`origin`**。
  - 若沒有，執行 `gh --version` 與 `gh auth status` 確認 `gh` CLI 是否已安裝並登入。
    - 若 `gh` 已安裝且已登入：執行 `gh repo create`（若不清楚 repo 名稱與可見性 public/private，先詢問使用者）。
    - 若否：請使用者自行在 github.com 建立一個空的 repo 並提供其網址，並在使用者確認後才 **停下來等待**，再執行 `git remote add origin <url>`。
- [ ] 新增 **`gh-pages`** 為 devDependency（若尚未安裝）：
  ```bash
  npm install -D gh-pages
  ```

### 執行步驟 (Execution)

1. 推送原始碼分支到遠端，確保實際程式碼（而不只是建置產物）也在 GitHub 上：
   ```bash
   git push -u origin <current-branch>
   ```
2. 從 remote URL 判斷 repo 名稱。若這是一個 project page（非自訂網域，也非 user/org root page），檢查 `vite.config.ts` 的 `build` 區塊是否已設定符合 `/<repo>/` 的 **`base`**；若缺少則補上並 commit 該變更。
3. 執行建置：
   ```bash
   npm run build
   ```
4. 發佈到 `gh-pages` 分支：
   ```bash
   npx gh-pages -d build
   ```

### 驗證方式 (Verification)

- 確認 `gh-pages` 分支已成功更新（發佈指令未回報錯誤）。
- 向使用者回報：
  - **Pages URL**：`https://<user>.github.io/<repo>/`（若有設定自訂網域則改用該網域）。
  - 一行提醒：此部署上的 **簽名/登入/分數資料無法運作**（沒有後端）－ **訪客模式 (guest mode) 不受影響**。並提及 **`/deploy_vercel`** 是可取得完整功能部署的替代方案。
