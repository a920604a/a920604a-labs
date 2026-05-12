# 離職集章證明 PDF 重設計

**日期：** 2026-05-12  
**狀態：** 待實作

---

## 目標

將現有的純文字 PDF 升級為現代簡約風格的單頁「求職分析報告」，包含視覺化版面與 AI 驅動的三欄職涯分析。

---

## 版面設計（A4，595 × 842 pt）

```
┌─────────────────────────────────────────┐
│ Block 1: Header（深紅橫條，h=100pt）    │
│  離職集章證明              2026-05-12   │
│  {userName}                             │
├─────────────────────────────────────────┤
│                                         │
│  Block 2: Stats 卡片（淺灰底）          │
│  🏮 已蓋 XX 章       完成度 XX%        │
│                                         │
│  Block 3: AI 三欄分析（白底）           │
│  ┌──────────┬──────────┬─────────────┐  │
│  │ 離職根因  │你真正重視 │ 求職方向    │  │
│  │          │          │             │  │
│  │ ~100字   │ ~100字   │ ~100字      │  │
│  └──────────┴──────────┴─────────────┘  │
│                                         │
│ ─────────────────────────────────────── │
│  由 Cloudflare Workers AI 生成           │
└─────────────────────────────────────────┘
```

### 配色

| 區塊 | 背景色 | 文字色 |
|------|--------|--------|
| Header | `rgb(0.6, 0.1, 0.1)` 深紅 | white |
| Stats 卡片 | `rgb(0.96, 0.96, 0.96)` 淺灰 | dark |
| 三欄區 | white | dark |
| 欄間分隔線 | `rgb(0.85, 0.85, 0.85)` | — |
| Footer 線 | `rgb(0.8, 0.8, 0.8)` | gray |

### 字型

沿用現有 Noto Sans TC（jsDelivr CDN）。

### 尺寸規格

| 元素 | 數值 |
|------|------|
| 頁面 | 595 × 842 pt (A4) |
| Header 高度 | 100 pt |
| 左右邊距 | 40 pt |
| Stats 卡片高度 | 60 pt，距 header 20 pt |
| 三欄區 y 起點 | header + stats + 40pt gap |
| 三欄欄寬 | (595 - 80 - 2) / 3 ≈ 171 pt |
| Footer y | 40 pt from bottom |

---

## 新 API 端點：`POST /ai/pdf-report`

### 檔案

- Create: `workers/resign-api/src/handlers/pdfReport.ts`
- Modify: `workers/resign-api/src/index.ts`（加入路由）

### Request

```json
{
  "stamps": [
    { "index": 1, "reason": "加班沒有補償", "timestamp": 1234567890 },
    ...
  ],
  "userName": "王小明"
}
```

### Response

```json
{
  "causes": "離職根因分析文字（100字內）",
  "values": "你真正重視的事（100字內）",
  "advice": "求職方向建議（100字內）"
}
```

### Prompt

```
系統：你是一位資深職涯顧問，擅長從離職經歷中幫助人找到更適合的下一份工作。

用戶：以下是 {userName} 記錄的 {count} 筆離職理由：
{reasons}

請以 JSON 格式輸出分析，包含三個欄位，每欄 100 字以內，繁體中文：
{
  "causes": "歸納 2-3 個核心離職原因類別",
  "values": "從痛點反推出此人真正重視的工作條件",
  "advice": "具體求職建議：應找什麼、應避開什麼、面試時應問什麼"
}
只輸出 JSON，不要其他文字。
```

### 解析保護

Worker 端對 AI 輸出做 JSON.parse，若失敗回傳 400；三個欄位任一為空則填入預設文字「分析資料不足」。

---

## 前端改動

### 檔案

- Modify: `apps/resign-stamp/src/pages/Dashboard.tsx`

### 新增 state

```ts
const [pdfReport, setPdfReport] = useState<{ causes: string; values: string; advice: string } | null>(null)
const [generatingPdf, setGeneratingPdf] = useState(false)
```

### 匯出流程

```
按「匯出 PDF」
  ↓
setGeneratingPdf(true)
  ↓
pdfReport 已存在?
  ├── 是 → 直接呼叫 generatePdf(pdfReport)
  └── 否 → 呼叫 POST /ai/pdf-report
            ├── 成功 → setPdfReport(result) → generatePdf(result)
            └── 失敗 → toast 錯誤 → 結束
setGeneratingPdf(false)
```

匯出按鈕在 `generatingPdf` 期間顯示 loading 狀態。

### generatePdf 完整重寫

`generatePdf(report: { causes: string; values: string; advice: string })` 接受 report 參數，依新版面繪製：

1. **Header 色塊**：`drawRectangle` 填深紅，疊繪標題、姓名、日期（白色文字）
2. **Stats 卡片**：`drawRectangle` 填淺灰，繪章數大字 + 完成百分比
3. **三欄標題列**：三個欄位各繪標題（粗體、深色）
4. **欄間分隔線**：兩條垂直 `drawLine`
5. **三欄內文**：各欄文字換行繪製（中文按字符寬度換行，每行約 18 字）
6. **Footer 橫線 + 文字**

### ProgressSection 按鈕

`onExport` prop 改名為 `onExport`（維持不變），但按鈕在 `generatingPdf` 為 true 時顯示 loading。需新增 `isExporting?: boolean` prop 給 ProgressSection。

---

## 不影響的部分

- Dashboard 的 `/ai/analyze` 分析卡片維持不變（兩個功能獨立）
- `pdfReport` state 和 `aiReport` state 分開，互不影響
- ReasonModal、DailyQuote 不動

---

## 錯誤處理

| 情境 | 行為 |
|------|------|
| `/ai/pdf-report` 失敗 | toast「PDF 分析失敗，請稍後再試」，不生成 PDF |
| AI JSON 解析失敗 | Worker 回 400，前端同上 |
| 字型載入失敗 | 現有 toast 邏輯，不生成 PDF |
| stamps 為空 | 匯出按鈕 disabled（現有邏輯已處理） |
