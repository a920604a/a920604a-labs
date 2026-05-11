# CLAUDE.md

本文件為 Claude Code（claude.ai/code）在此專案中工作時的指引。

## 常用指令

```bash
# 安裝相依套件
pnpm install

# 開發（僅前端）
pnpm --filter @a920604a/root dev          # → http://localhost:5173

# 開發（前端 + Worker 同時啟動）
pnpm dev                                   # NX 執行所有有 dev script 的套件

# 僅啟動 Worker
pnpm --filter @a920604a/ebook-api dev     # → http://localhost:8787

# 建置
pnpm --filter @a920604a/root build        # production build（tsc + vite）

# Lint / 型別檢查 / 格式化（全 workspace）
pnpm lint
pnpm typecheck
pnpm format
```

此專案目前無測試腳本。

## 架構

這是一個以 NX 管理的 **pnpm monorepo**，目錄結構如下：

```
apps/root/          # 唯一的 Vite 建置入口 — 組裝所有模組成單一 SPA
apps/{module}/      # 四個功能模組（library-only，無各自的 vite.config.ts）
packages/auth/      # @a920604a/auth — Firebase Auth 封裝 + React context
packages/ui/        # @a920604a/ui — GlobalShell、LoginPage、AppShell、NavBar、theme
workers/ebook-api/  # Cloudflare Worker + D1 + R2（電子書 REST API）
```

### 關鍵架構規則

- **`apps/root` 是唯一的建置目標。** 四個模組套件（`ebook-reader`、`habit-tracker`、`resign-stamp`、`to-do-list`）沒有自己的 `vite.config.ts`，不會獨立建置，而是透過 pnpm workspace symlink 由 `apps/root` 的 Vite 統一打包。
- **模組套件匯出單一預設路由元件**（`export { default } from './App'`），其 `App.tsx` 定義 react-router-dom 的子路由，並掛載於 `apps/root/src/App.tsx`。
- **Feature flags**（`apps/root/src/config/features.ts`）透過 `VITE_FEATURE_*` 環境變數控制模組的顯示與路由（預設全部啟用）。將變數設為 `'false'` 可在建置時停用該模組。
- **`@a920604a/auth`** 匯出 `initFirebase`、`getFirebaseAuth`、`getFirebaseFirestore`、`AuthProvider`、`useAuth`，在 `apps/root/src/main.tsx` 初始化一次。
- **`@a920604a/ui`** 匯出 `GlobalShell`（macOS HIG 風格側邊欄殼層）與 `LoginPage`。`GlobalShell` 接受 `modules: SidebarModule[]` prop，導覽設定完全由呼叫端控制，殼層內部無硬編碼路由。
- **Vite 從專案根目錄讀取 `.env`**（`apps/root/vite.config.ts` 中的 `envDir: '../../'`），所有 `VITE_*` 變數需放置於根目錄的 `.env`。

### Cloudflare Worker（`workers/ebook-api`）

電子書模組的 REST API，使用 Cloudflare D1（SQLite）和 R2（PDF 儲存）。所有端點需要 `Authorization: Bearer <Firebase ID token>`。本地開發使用 `.dev.vars`（非 `.env`）。Wrangler 設定：`workers/ebook-api/wrangler.toml`。

### 環境變數

根目錄 `.env`（由 Vite 讀取）：
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_EBOOK_API_URL=https://ebook-api.a920604a.workers.dev
# 選用 feature flags（不設定 = 啟用，設為 'false' = 停用）
VITE_FEATURE_TODO_LIST=
VITE_FEATURE_HABIT_TRACKER=
VITE_FEATURE_EBOOK_READER=
VITE_FEATURE_RESIGN_STAMP=
```

`workers/ebook-api/.dev.vars`（由 `wrangler dev` 自動讀取）：
```
FIREBASE_PROJECT_ID=a920604a-labs
ALLOWED_ORIGINS=http://localhost:5173
```

## 部署

Push 到 `main` 分支會觸發 GitHub Actions（`.github/workflows/deploy.yml`）：
1. `apps/root` → Cloudflare Pages（`a920604a-labs`）
2. `workers/ebook-api` → Cloudflare Workers（`ebook-api`）

手動部署：
```bash
pnpm wrangler pages deploy apps/root/dist --project-name=a920604a-labs
pnpm wrangler deploy --config workers/ebook-api/wrangler.toml
```
