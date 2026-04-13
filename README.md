# a920604a Labs

一個 pnpm monorepo，整合四個實用小工具，使用 React 19 + Chakra UI + Firebase + Cloudflare 部署。

**Production URL：** https://a920604a-labs.pages.dev

---

## 功能模組

### 🏮 離職集章（Resign Stamp）
記錄每一個想離職的瞬間，逐章累積成你的離職故事。

- **集章板**：100 格印章格，點擊蓋章並輸入當下原因
- **進度統計**：已蓋章數、剩餘章數、完成百分比、里程碑進度條
- **成就徽章**：達成 25 / 50 / 75 / 100 章時自動解鎖
- **每日箴言**：依日期輪播離職勵志語錄
- **理由總覽**：搜尋、排序、複製、匯出所有蓋章理由（.txt）
- **匯出 PDF**：一鍵生成離職集章證明報告

### ✅ 習慣追蹤（Habit Tracker）
追蹤每日習慣打卡，養成好習慣。

- 新增 / 刪除習慣（自訂顏色）
- 每日打卡 & 取消打卡
- 日曆視圖：一眼看出打卡連續天數
- 統計分析頁：週/月打卡率圖表
- 成就徽章：連續打卡里程碑
- 瀏覽器通知提醒（Reminder）

### 📝 待辦清單（To-Do List）
管理每日任務，提升生產力。

- 新增 / 完成 / 刪除待辦事項
- 截止日期設定，接近到期顯示警示色
- 標籤分類（工作 / 學習 / 個人 / 其他）
- 列表 / 統計 / 日曆 三種視圖切換
- Firebase Firestore 即時同步

### 📚 電子書閱讀（Ebook Reader）
上傳管理並閱讀 PDF 電子書。

- 上傳 PDF → IndexedDB 本機儲存
- 書籍分類標籤、搜尋篩選
- 已讀 / 正在讀 / 未讀 狀態追蹤
- 書籍統計圓餅圖（分類分佈 & 閱讀狀態）
- 閱讀進度自動同步（Cloudflare Worker D1）
- 夜間模式閱讀器、記憶上次閱讀頁碼

---

## 技術架構

```
a920604a-labs/
├── apps/
│   ├── root/               # 主 SPA 入口（薄殼，只含路由組裝與 HubPage）
│   │   └── src/
│   │       ├── App.tsx         # BrowserRouter + MODULES 導覽設定 + GlobalShell
│   │       ├── main.tsx        # Firebase 初始化 + React 掛載
│   │       └── pages/
│   │           └── HubPage.tsx # 首頁 App Hub
│   ├── ebook-reader/       # @a920604a/ebook-reader（workspace 套件）
│   ├── habit-tracker/      # @a920604a/habit-tracker（workspace 套件）
│   ├── resign-stamp/       # @a920604a/resign-stamp（workspace 套件）
│   └── to-do-list/         # @a920604a/to-do-list（workspace 套件）
├── packages/
│   ├── auth/               # @a920604a/auth：Firebase Auth（AuthProvider, useAuth）
│   ├── ui/                 # @a920604a/ui：共用 UI（GlobalShell, LoginPage, theme）
│   └── config/             # 預留共用設定
└── workers/
    └── ebook-api/          # Cloudflare Worker（電子書 API + D1）
```

### apps/root 的定位

`apps/root` 是整個 SPA 的**組裝點**，程式碼極少：

- `App.tsx` — 設定 `MODULES` 導覽陣列，傳給 `<GlobalShell>`，組裝四個模組的 Route
- `main.tsx` — 初始化 Firebase、掛載 ChakraProvider / AuthProvider
- `pages/HubPage.tsx` — 首頁卡片列表

所有功能邏輯都在各模組套件（`apps/ebook-reader/src/`、`apps/habit-tracker/src/`、…）內，`apps/root` 只負責把它們串起來部署。

### GlobalShell（packages/ui）

`@a920604a/ui` 匯出的 `GlobalShell` 是完全可配置的通用殼：

```tsx
import { GlobalShell } from '@a920604a/ui'
import type { SidebarModule } from '@a920604a/ui'

const MODULES: SidebarModule[] = [
  { path: '/', label: '首頁', exact: true },
  {
    path: '/habit-tracker',
    label: '習慣追蹤',
    icon: <SomeIcon />,
    subItems: [
      { label: '儀表板', path: '/habit-tracker/dashboard' },
      { label: '統計分析', path: '/habit-tracker/statistics' },
    ],
  },
  // ...
]

<GlobalShell user={user} onLogout={logout} modules={MODULES} brandName="My App">
  {/* 頁面內容 */}
</GlobalShell>
```

設計特點（Apple HIG 風格）：
- 桌面端：左側固定 Sidebar（240px），所有模組導覽在此，Topbar 極簡
- 行動端：Topbar 漢堡選單 → 左滑 Drawer 導覽
- 當前模組自動展開子頁面（filled active state，仿 macOS Finder）
- Topbar 磨砂玻璃效果（backdrop-filter blur）

### 技術棧

| 層級 | 技術 |
|------|------|
| UI 框架 | React 19 + TypeScript |
| 元件庫 | Chakra UI 2.x |
| 路由 | React Router DOM v7 |
| 建置工具 | Vite + NX 20 monorepo |
| 套件管理 | pnpm workspaces |
| 認證 | Firebase Auth（Google Sign-In） |
| 資料庫 | Firebase Firestore |
| 本機儲存 | IndexedDB（PDF 檔案） |
| 後端 API | Cloudflare Workers |
| API 資料庫 | Cloudflare D1（SQLite） |
| 部署 | Cloudflare Pages（前端）+ Cloudflare Workers（API） |
| CI/CD | GitHub Actions |

---

## 本地開發

### 前置需求

- Node.js 20+
- pnpm 10+
- Firebase 專案（需 Firestore + Google Auth）
- Cloudflare 帳號（電子書 API 功能需要）

### 安裝

```bash
git clone https://github.com/a920604a/a920604a-labs.git
cd a920604a-labs
pnpm install
```

### 環境變數

在**根目錄**建立 `.env`（Vite 透過 `envDir: '../../'` 讀取）：

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_EBOOK_API_URL=https://ebook-api.<subdomain>.workers.dev
```

在 `workers/ebook-api/` 建立 `.dev.vars`：

```env
FIREBASE_PROJECT_ID=your-project-id
ALLOWED_ORIGINS=http://localhost:5173
```

### 啟動開發伺服器

```bash
# 啟動主應用（前端）
pnpm --filter @a920604a/root dev
# → http://localhost:5173

# 啟動 Cloudflare Worker（電子書 API，選用）
pnpm --filter @a920604a/ebook-api dev
```

> **注意**：直接在根目錄執行 `pnpm dev` 會同時啟動前端與 Worker，
> 但推薦各自啟動以方便查看各自的 log。

### 建置

```bash
pnpm --filter @a920604a/root build
```

---

## 部署

### GitHub Secrets 設定

在 GitHub repo → Settings → Secrets and variables → Actions 新增：

| Secret | 說明 |
|--------|------|
| `FIREBASE_API_KEY` | Firebase 專案 API Key |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `FIREBASE_PROJECT_ID` | Firebase 專案 ID |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID |
| `FIREBASE_APP_ID` | Firebase App ID |
| `EBOOK_API_URL` | Cloudflare Worker URL |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |

### CI/CD 流程

Push 到 `main` 分支後，GitHub Actions 自動執行：

1. **deploy-root** — 建置 React 應用並部署至 Cloudflare Pages（`apps/root`）
2. **deploy-ebook-api** — 部署 Cloudflare Worker（`workers/ebook-api`）

---

## Cloudflare 資源

| 資源 | 名稱 | 說明 |
|------|------|------|
| Pages | `a920604a-labs` | 前端靜態網站 |
| Worker | `ebook-api` | 電子書元數據 & 閱讀進度 API |
| D1 | `ebook-db` | 電子書資料庫（SQLite） |

### D1 Schema 初始化

```bash
cd workers/ebook-api
pnpm wrangler d1 execute ebook-db --remote --file=schema.sql
```

---

## License

MIT
