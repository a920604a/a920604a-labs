# a920604a Labs

pnpm monorepo，整合四個實用工具。React 19 + TypeScript + Chakra UI + Firebase + Cloudflare。

**Production：** https://a920604a-labs.pages.dev  
**GitHub：** https://github.com/a920604a/a920604a-labs

---

## 專案結構

```
a920604a-labs/
├── apps/
│   ├── root/            # SPA 入口（路由組裝 + HubPage）
│   ├── ebook-reader/    # @a920604a/ebook-reader
│   ├── habit-tracker/   # @a920604a/habit-tracker
│   ├── resign-stamp/    # @a920604a/resign-stamp
│   └── to-do-list/      # @a920604a/to-do-list
├── packages/
│   ├── auth/            # @a920604a/auth（Firebase Auth）
│   └── ui/              # @a920604a/ui（GlobalShell, LoginPage, theme）
└── workers/
    └── ebook-api/       # Cloudflare Worker + D1（電子書 API）
```

### apps/root

SPA 唯一的建置入口，程式碼極精簡：

| 檔案 | 職責 |
|---|---|
| `src/main.tsx` | Firebase `initFirebase()`、掛載 ChakraProvider + AuthProvider |
| `src/App.tsx` | BrowserRouter、`MODULES` 導覽設定、`<GlobalShell>`、四個模組 Route |
| `src/pages/HubPage.tsx` | 首頁啟動頁（時段問候 + 四個模組卡片） |

所有功能邏輯在各模組套件（`apps/*/src/`）內，`apps/root` 只負責組裝部署。

### 模組套件（library-only）

四個模組皆為 workspace 套件，格式：

```
apps/{module}/
├── package.json   # name: @a920604a/{module}，exports ./src/index.ts
├── tsconfig.json  # moduleResolution: bundler，allowJs: true
└── src/
    ├── index.ts   # export { default } from './App'
    ├── App.tsx    # React Router sub-routes
    ├── pages/
    ├── components/
    ├── hooks/     # (部分模組)
    └── utils/     # (部分模組)
```

各模組**無 vite.config.ts**，透過 pnpm workspace symlink 由 `apps/root` 的 Vite 統一打包。

### packages/auth（@a920604a/auth）

```ts
// 匯出
initFirebase(config)      // 初始化 Firebase App（幂等）
getFirebaseAuth()         // 取得 Auth instance
getFirebaseFirestore()    // 取得 Firestore instance
AuthProvider              // React Context Provider
useAuth()                 // → { user, loading, signInWithGoogle, logout }
```

### packages/ui（@a920604a/ui）

```ts
// 匯出
GlobalShell      // macOS HIG sidebar shell（props: modules, user, onLogout, brandName）
LoginPage        // Google 登入頁
AppShell         // 簡易 layout wrapper（含 NavBar）
NavBar           // 獨立 top navigation bar
theme            // Chakra UI 擴充主題（brand 色系 + Noto Sans TC）

// GlobalShell 類型
interface SidebarModule {
  path: string
  label: string
  icon?: ReactNode
  subItems?: { label: string; path: string }[]
  exact?: boolean
}
```

GlobalShell 設計特點：
- 桌面端：固定左側 Sidebar（240px），Topbar 磨砂玻璃效果（backdrop-filter）
- 行動端：Hamburger → 左滑 Drawer
- Active state：Filled rounded rect（仿 macOS Finder）
- 導覽設定完全由呼叫端的 `modules` prop 控制，無硬編碼路由

---

## 功能模組

### 📝 待辦清單
Firebase Firestore 即時同步。截止日期警示、標籤分類（工作／學習／個人／其他）、
列表 ／ 統計 ／ 日曆三視圖、Tiptap 富文字備註。

### ✅ 習慣追蹤
每日打卡、連續天數、成就徽章（Firestore）。統計頁：週/月打卡率折線圖、熱力圖、
長條圖（Recharts + Chart.js）。瀏覽器通知提醒、PDF 匯出（pdf-lib）。

### 📚 電子書
PDF 上傳 → IndexedDB 本機快取 + Cloudflare Worker D1 遠端同步。
@react-pdf-viewer 閱讀器、閱讀進度記憶、分類書庫、圓餅統計圖。

### 🏮 離職集章
100 格印章格（點擊蓋章 + 輸入理由）、進度條、成就徽章、每日箴言。
理由總覽搜尋／排序／匯出 .txt，一鍵生成 PDF 離職集章證明（pdf-lib + fontkit）。

---

## 技術棧

| 層級 | 技術 | 版本 |
|---|---|---|
| UI 框架 | React + TypeScript | 19.x / 5.8 |
| 元件庫 | Chakra UI | 2.x |
| 路由 | React Router DOM | 7.x |
| 建置 | Vite + SWC | 6.x |
| Monorepo | pnpm workspaces + NX | 10.x / 20.x |
| 認證 | Firebase Auth（Google Sign-In） | 11.x |
| 資料庫 | Firebase Firestore | 11.x |
| 本機儲存 | IndexedDB（原生 API） | — |
| 後端 API | Cloudflare Workers | — |
| API DB | Cloudflare D1（SQLite） | — |
| 部署 | Cloudflare Pages + Workers | — |
| CI/CD | GitHub Actions | — |

### Cloudflare Worker API（ebook-api）

端點（均需 `Authorization: Bearer <Firebase ID token>`）：

| Method | Path | 說明 |
|---|---|---|
| `GET` | `/books?user_id=` | 取得書單 |
| `POST` | `/books` | 新增書籍 |
| `DELETE` | `/books/:id?user_id=` | 刪除書籍 + 進度 |
| `GET` | `/progress/:bookId?user_id=` | 取得閱讀進度 |
| `PUT` | `/progress/:bookId` | 更新閱讀進度 |

---

## 本地開發

### 前置需求

- Node.js 20+
- pnpm 10+（`npm i -g pnpm`）

### 安裝

```bash
git clone git@github.com:a920604a/a920604a-labs.git
cd a920604a-labs
pnpm install
```

### 環境變數

根目錄建立 `.env`（Vite 透過 `apps/root/vite.config.ts` 的 `envDir: '../../'` 讀取）：

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_EBOOK_API_URL=https://ebook-api.a920604a.workers.dev
```

`workers/ebook-api/.dev.vars`（wrangler dev 自動讀取）：

```env
FIREBASE_PROJECT_ID=a920604a-labs
ALLOWED_ORIGINS=http://localhost:5173
```

### 啟動

```bash
# 前端（主應用）
pnpm --filter @a920604a/root dev
# → http://localhost:5173

# Cloudflare Worker（電子書 API，選用）
pnpm --filter @a920604a/ebook-api dev
# → http://localhost:8787
```

> `pnpm dev`（根目錄）會用 NX 同時啟動所有有 `dev` script 的套件（apps/root + ebook-api worker），
> 適合需要完整功能測試時使用。

### 其他指令

```bash
pnpm --filter @a920604a/root build       # 前端 production build
pnpm --filter @a920604a/root preview     # 預覽 build 結果
pnpm lint                                # 全 workspace ESLint
pnpm typecheck                           # 全 workspace tsc
pnpm format                              # Prettier 格式化
```

---

## 部署

### 方式一：Push 到 GitHub 自動部署（推薦）

CI/CD 設定在 `.github/workflows/deploy.yml`，Push 到 `main` 分支自動觸發：

1. **deploy-root** — `apps/root` 建置 → 部署到 Cloudflare Pages（`a920604a-labs`）
2. **deploy-ebook-api** — `workers/ebook-api` 部署到 Cloudflare Workers

#### 設定 GitHub Secrets

前往 GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**，依序新增：

| Secret 名稱 | 取得方式 |
|---|---|
| `FIREBASE_API_KEY` | Firebase Console → 專案設定 → 一般 → 網頁應用程式 |
| `FIREBASE_AUTH_DOMAIN` | 同上 |
| `FIREBASE_PROJECT_ID` | 同上 |
| `FIREBASE_STORAGE_BUCKET` | 同上 |
| `FIREBASE_MESSAGING_SENDER_ID` | 同上 |
| `FIREBASE_APP_ID` | 同上 |
| `EBOOK_API_URL` | Worker 部署後的 URL（`https://ebook-api.<subdomain>.workers.dev`） |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token（需 Pages + Workers 寫入權限） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → 右側欄 Account ID |

#### 推送部署

```bash
git add .
git commit -m "your message"
git push origin main
# → GitHub Actions 自動 build + deploy
```

### 方式二：手動部署

```bash
# 前端
pnpm --filter @a920604a/root build
pnpm wrangler pages deploy apps/root/dist --project-name=a920604a-labs

# Worker
pnpm wrangler deploy \
  --var FIREBASE_PROJECT_ID:a920604a-labs \
  --config workers/ebook-api/wrangler.jsonc
```

---

## 初次設定 Cloudflare 資源

若是第一次部署，需先建立以下資源：

```bash
# 1. 建立 D1 資料庫
pnpm wrangler d1 create ebook-db
# 複製輸出的 database_id 填入 workers/ebook-api/wrangler.jsonc

# 2. 初始化 schema
pnpm wrangler d1 execute ebook-db \
  --remote \
  --file=workers/ebook-api/schema.sql \
  --config=workers/ebook-api/wrangler.jsonc

# 3. 建立 Cloudflare Pages 專案（第一次 deploy 時 wrangler 會自動建立）
```

| Cloudflare 資源 | 名稱 |
|---|---|
| Pages | `a920604a-labs` |
| Worker | `ebook-api` |
| D1 | `ebook-db` |

---

## License

MIT
