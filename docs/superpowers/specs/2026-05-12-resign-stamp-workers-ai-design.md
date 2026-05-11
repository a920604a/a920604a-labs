# 離職簽章 × Cloudflare Workers AI 設計文件

**日期：** 2026-05-12  
**狀態：** 待實作

---

## 目標

為離職簽章（resign-stamp）模組串接 Cloudflare Workers AI，新增三個 AI 功能：

| # | 功能 | 入口 |
|---|------|------|
| A | AI 生成每日箴言 | Dashboard `DailyQuote` 元件 |
| B | AI 分析離職故事 | Dashboard 按鈕 + PDF 匯出 |
| C | AI 潤色蓋章理由 | ReasonModal 按鈕 |

---

## 新增 Cloudflare 服務

| 服務 | 說明 |
|------|------|
| **Cloudflare Workers** | 新建 `workers/resign-api`，處理所有 AI 請求 |
| **Workers AI** | binding 名稱 `AI`，模型 `@cf/qwen/qwen1.5-14b-chat-awq` |

不新增 D1 / R2；AI 結果不持久化，由前端 state 暫存。

---

## Worker 架構

```
workers/resign-api/
├── wrangler.toml
├── package.json
└── src/
    ├── index.ts           # 路由入口、CORS、錯誤處理
    ├── auth.ts            # Firebase ID token 驗證（同 ebook-api 模式）
    └── handlers/
        ├── dailyQuote.ts  # POST /ai/daily-quote
        ├── analyze.ts     # POST /ai/analyze
        └── polish.ts      # POST /ai/polish
```

### wrangler.toml 關鍵設定

```toml
name = "resign-api"
main = "src/index.ts"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]

[ai]
binding = "AI"

[vars]
FIREBASE_PROJECT_ID = "a920604a-labs"
ALLOWED_ORIGINS = "http://localhost:5173,https://a920604a-labs.pages.dev"
```

### Env 介面

```ts
export interface Env {
  AI: Ai
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGINS: string
}
```

---

## API 端點

所有端點均需 `Authorization: Bearer <Firebase ID token>`。

### `POST /ai/daily-quote`

**Body：**
```json
{ "date": "2026-05-12" }
```

**Response：**
```json
{ "quote": "離開是為了更好的抵達。" }
```

**Prompt：**
```
系統：你是一個幽默又溫暖的職場心理師，專門幫助想離職的人找到勇氣。
用戶：請為今天（{date}）生成一句繁體中文的離職箴言，
      30 字以內，帶點哲理或幽默感，不要引號，只輸出句子本身。
```

---

### `POST /ai/polish`

**Body：**
```json
{ "reason": "老闆又在亂罵人，我受夠了" }
```

**Response：**
```json
{ "polished": "長期承受無理的言語壓力，已超過一個人應有的職場底線。" }
```

**Prompt：**
```
系統：你是一個文字編輯，擅長把口語化的抱怨改寫得更有力道、更有故事感。
用戶：把以下離職原因改寫成一句更有表達力的繁體中文，
      保留原意，100 字以內，只輸出改寫後的文字：
      "{reason}"
```

---

### `POST /ai/analyze`

**Body：**
```json
{
  "stamps": [
    { "index": 1, "reason": "加班沒有補償", "timestamp": 1234567890 },
    ...
  ]
}
```

**Response：**
```json
{ "report": "你的離職理由主要集中在..." }
```

**Prompt：**
```
系統：你是一個職涯分析師，善於從離職紀錄中找出模式與洞察。
用戶：以下是一個人蓋了 {count} 章的離職理由清單：
      {reasons}
      請用繁體中文寫一段 150 字以內的分析，
      找出主要的離職動機類型、情緒模式，最後給一句鼓勵。
      只輸出分析本文，不要標題。
```

---

## 前端改動

### 1. `DailyQuote.tsx`

- 掛載時呼叫 `POST /ai/daily-quote`
- Loading 期間顯示 Chakra `Skeleton`
- 失敗時 fallback 到現有硬編碼陣列（依日期取餘數），使用者無感知

### 2. `ReasonModal.tsx`（AI 潤色）

UI 佈局：

```
┌─────────────────────────────────┐
│ 🔖 蓋第 N 章                    │
├─────────────────────────────────┤
│ [Textarea - 使用者輸入]          │
│                        200 / 200│
│              [✨ AI 潤色]        │
├─────────────────────────────────┤
│ ✨ AI 建議                       │  ← 按下潤色後出現
│ Skeleton / "潤色後的文字..."     │
│                      [用這個 →] │
├─────────────────────────────────┤
│ [取消]          [🔖 蓋章確認]   │
└─────────────────────────────────┘
```

- `✨ AI 潤色` 按鈕：`reason.trim().length > 0` 才啟用
- 呼叫 `/ai/polish` 期間顯示 Skeleton，完成後顯示結果卡片
- `用這個 →` 點擊後將 AI 版本填入 Textarea，使用者可再次編輯
- AI 建議區塊預設隱藏，按下潤色後才展開

### 3. `Dashboard.tsx`（AI 分析）

- ProgressSection 下方新增「✨ AI 分析我的離職故事」按鈕
  - `stamps.length === 0` 時 disabled
  - 點擊後呼叫 `/ai/analyze`，結果存入 `aiReport` state
- 結果以卡片形式顯示在按鈕下方（橘色左邊框，風格同 DailyQuote）
- `generatePdf()` 修改：若 `aiReport` 不為空，在 PDF 第一頁插入「AI 離職故事分析」段落，正文第二頁起才是蓋章清單

---

## 環境變數

根目錄 `.env` 新增：
```
VITE_RESIGN_API_URL=https://resign-api.a920604a.workers.dev
```

`workers/resign-api/.dev.vars`：
```
FIREBASE_PROJECT_ID=a920604a-labs
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 錯誤處理原則

| 情境 | 行為 |
|------|------|
| `/ai/daily-quote` 失敗 | silent fallback 到硬編碼陣列 |
| `/ai/polish` 失敗 | toast 提示「AI 潤色暫時無法使用」，不影響蓋章流程 |
| `/ai/analyze` 失敗 | toast 提示「分析失敗，請稍後再試」 |
| Token 驗證失敗 | Worker 回 401，前端 toast 提示並不顯示 AI 內容 |

---

## 部署變動

`deploy.yml` 新增 job：

```yaml
deploy-resign-api:
  name: Deploy resign-api worker
  # 同 deploy-ebook-api 模式
  # wrangler deploy --var FIREBASE_PROJECT_ID:...
```

GitHub Secrets 新增：
- `RESIGN_API_URL`（供前端 `VITE_RESIGN_API_URL` 注入）
