# PDF Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將離職集章的 PDF 匯出重設計為 A4 現代簡約版面，含深紅 Header、Stats 卡片、AI 三欄職涯分析，並新增 `/ai/pdf-report` Worker 端點。

**Architecture:** 新增 `handlers/pdfReport.ts` 提供 PDF 專用 AI 分析（一次呼叫輸出 JSON 三欄）；前端 `generatePdf` 完全重寫為 A4 版面；`ProgressSection` 加 `isExporting` prop；匯出時若無分析則自動觸發。

**Tech Stack:** pdf-lib, Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`), TypeScript, React, Chakra UI

---

## File Map

**新建：**
- `workers/resign-api/src/handlers/pdfReport.ts` — POST /ai/pdf-report，輸出 `{ causes, values, advice }`

**修改：**
- `workers/resign-api/src/index.ts` — 加入 `/ai/pdf-report` 路由
- `apps/resign-stamp/src/components/ProgressSection.tsx` — 加 `isExporting?: boolean` prop
- `apps/resign-stamp/src/pages/Dashboard.tsx` — 加 `pdfReport`/`generatingPdf` state、`handleExport` 函式、重寫 `generatePdf`

---

## Task 1: POST /ai/pdf-report handler

**Files:**
- Create: `workers/resign-api/src/handlers/pdfReport.ts`

- [ ] **Step 1: 建立 handler**

`workers/resign-api/src/handlers/pdfReport.ts`:
```ts
import type { Env } from '../index'

interface Stamp {
  index: number
  reason: string
  timestamp: number
}

interface PdfReportResult {
  causes: string
  values: string
  advice: string
}

const DEFAULT: PdfReportResult = {
  causes: '分析資料不足',
  values: '分析資料不足',
  advice: '分析資料不足',
}

export async function handlePdfReport(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { stamps, userName } = await req.json() as { stamps: Stamp[]; userName: string }

  const reasons = stamps.map((s, i) => `${i + 1}. ${s.reason}`).join('\n')

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: '你是一位資深職涯顧問，擅長從離職經歷中幫助人找到更適合的下一份工作。請只輸出 JSON，不要有其他文字。',
      },
      {
        role: 'user',
        content: `以下是 ${userName} 記錄的 ${stamps.length} 筆離職理由：\n${reasons}\n\n請以 JSON 格式輸出分析，每欄 100 字以內，繁體中文：\n{"causes":"歸納2-3個核心離職原因類別","values":"從痛點反推出此人真正重視的工作條件","advice":"具體求職建議：應找什麼、應避開什麼、面試時應問什麼"}`,
      },
    ],
  }) as { response: string }

  let parsed: PdfReportResult = { ...DEFAULT }
  try {
    const raw = result.response?.trim() ?? ''
    const jsonStr = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
    const obj = JSON.parse(jsonStr) as Partial<PdfReportResult>
    parsed = {
      causes: obj.causes || DEFAULT.causes,
      values: obj.values || DEFAULT.values,
      advice: obj.advice || DEFAULT.advice,
    }
  } catch {
    // fallback to DEFAULT
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add workers/resign-api/src/handlers/pdfReport.ts
git commit -m "feat: add /ai/pdf-report handler with three-column career analysis"
```

---

## Task 2: index.ts — 加入 /ai/pdf-report 路由

**Files:**
- Modify: `workers/resign-api/src/index.ts`

- [ ] **Step 1: 加入 import**

在 `workers/resign-api/src/index.ts` 現有的三個 import 之後加入：
```ts
import { handlePdfReport } from './handlers/pdfReport'
```

- [ ] **Step 2: 加入路由**

在 `if (req.method === 'POST' && path === '/ai/analyze')` 那行之後加入：
```ts
if (req.method === 'POST' && path === '/ai/pdf-report') return handlePdfReport(req, env, cors)
```

- [ ] **Step 3: 型別檢查 + Deploy**

```bash
cd workers/resign-api && pnpm exec tsc --noEmit
```

預期：無錯誤。

```bash
CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN ../../.env | cut -d= -f2) \
CLOUDFLARE_ACCOUNT_ID=a0ce05e1163dc5b1c2520a356c47b319 \
pnpm wrangler deploy --var FIREBASE_PROJECT_ID:a920604a-labs
```

預期最後一行：`https://resign-api.a920604a.workers.dev`

- [ ] **Step 4: Commit**

```bash
git add workers/resign-api/src/index.ts
git commit -m "feat: add /ai/pdf-report route to resign-api worker"
```

---

## Task 3: ProgressSection.tsx — isExporting prop

**Files:**
- Modify: `apps/resign-stamp/src/components/ProgressSection.tsx`

- [ ] **Step 1: 更新 interface 與 props**

將現有：
```ts
interface ProgressSectionProps {
  progress: number
  stamps: number
  maxStamps: number
  onExport: () => void
}

export default function ProgressSection({
  progress,
  stamps,
  maxStamps,
  onExport,
}: ProgressSectionProps) {
```

改為：
```ts
interface ProgressSectionProps {
  progress: number
  stamps: number
  maxStamps: number
  onExport: () => void
  isExporting?: boolean
}

export default function ProgressSection({
  progress,
  stamps,
  maxStamps,
  onExport,
  isExporting = false,
}: ProgressSectionProps) {
```

- [ ] **Step 2: 更新匯出按鈕**

將現有的 Button（`leftIcon={<DownloadIcon />}` 那個）完整替換為：
```tsx
<Button
  leftIcon={<DownloadIcon />}
  colorScheme="red"
  variant="solid"
  onClick={onExport}
  isLoading={isExporting}
  loadingText="生成中…"
  size="md"
  borderRadius="lg"
  shadow="sm"
>
  匯出離職證明 PDF
</Button>
```

- [ ] **Step 3: 型別檢查**

```bash
pnpm typecheck 2>&1 | grep -E "Successfully|error"
```

預期：`NX   Successfully ran target typecheck for 5 projects`

- [ ] **Step 4: Commit**

```bash
git add apps/resign-stamp/src/components/ProgressSection.tsx
git commit -m "feat: ProgressSection add isExporting loading state"
```

---

## Task 4: Dashboard.tsx — 新 state + handleExport + generatePdf 重寫

**Files:**
- Modify: `apps/resign-stamp/src/pages/Dashboard.tsx`

這是最大的 task，分五個步驟。

- [ ] **Step 1: 加入 `pdf-lib` 的 `drawLine`、`drawRectangle` import**

現有第 18 行：
```ts
import { PDFDocument, rgb } from 'pdf-lib'
```

確認 `pdf-lib` 的 `drawRectangle` 和 `drawLine` 是 page 的方法，不需要額外 import。確認 `rgb` 已 import，不需要改動。

- [ ] **Step 2: 加入 pdfReport 與 generatingPdf state**

在 `const [analyzing, setAnalyzing] = useState(false)` 後加入：
```ts
const [pdfReport, setPdfReport] = useState<{ causes: string; values: string; advice: string } | null>(null)
const [generatingPdf, setGeneratingPdf] = useState(false)
```

- [ ] **Step 3: 加入 handleExport 函式**

在 `handleAnalyze` 函式之後（`// Achievement unlock notifications` 之前）加入：
```ts
const handleExport = async () => {
  setGeneratingPdf(true)
  try {
    let report = pdfReport
    if (!report) {
      const token = await getAuth().currentUser?.getIdToken()
      if (!token) throw new Error('no token')
      const res = await fetch(`${RESIGN_API_URL}/ai/pdf-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stamps, userName: user!.displayName || 'Anonymous' }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      report = await res.json() as { causes: string; values: string; advice: string }
      setPdfReport(report)
    }
    await generatePdf(report)
  } catch {
    toast({ title: 'PDF 分析失敗，請稍後再試', status: 'error', duration: 3000, isClosable: true })
  } finally {
    setGeneratingPdf(false)
  }
}
```

- [ ] **Step 4: 完整替換 generatePdf 函式**

將現有的 `const generatePdf = async () => { ... }` 整個替換為：

```ts
const generatePdf = async (report: { causes: string; values: string; advice: string }) => {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)
    const page = pdfDoc.addPage([595, 842])

    const FONT_CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tc@5/files/noto-sans-tc-chinese-traditional-400-normal.woff2'
    let fontBytes: ArrayBuffer
    try {
      const res = await fetch(FONT_CDN)
      if (!res.ok) throw new Error(`Font CDN ${res.status}`)
      fontBytes = await res.arrayBuffer()
    } catch (err) {
      toast({ title: '字體載入失敗，無法匯出 PDF', description: String(err), status: 'error', duration: 4000, isClosable: true })
      return
    }
    const font = await pdfDoc.embedFont(fontBytes)

    const W = 595
    const H = 842
    const MARGIN = 40
    const white    = rgb(1, 1, 1)
    const darkRed  = rgb(0.6, 0.1, 0.1)
    const lightGray = rgb(0.96, 0.96, 0.96)
    const sepGray  = rgb(0.85, 0.85, 0.85)
    const dark     = rgb(0.15, 0.15, 0.15)
    const mid      = rgb(0.45, 0.45, 0.45)
    const accent   = rgb(0.6, 0.1, 0.1)

    // ── Block 1: Header ──────────────────────────────────────
    const headerH = 100
    const headerY = H - headerH                            // 742
    page.drawRectangle({ x: 0, y: headerY, width: W, height: headerH, color: darkRed })
    page.drawText('離職集章證明', {
      x: MARGIN, y: headerY + 58, size: 26, font, color: white,
    })
    page.drawText(user!.displayName || 'Anonymous', {
      x: MARGIN, y: headerY + 24, size: 11, font, color: rgb(0.9, 0.9, 0.9),
    })
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
    page.drawText(today, {
      x: W - MARGIN - 90, y: headerY + 24, size: 11, font, color: rgb(0.9, 0.9, 0.9),
    })

    // ── Block 2: Stats card ───────────────────────────────────
    const statsCardH = 55
    const statsCardY = headerY - 20 - statsCardH           // 667
    page.drawRectangle({ x: MARGIN, y: statsCardY, width: W - MARGIN * 2, height: statsCardH, color: lightGray })
    page.drawText(`已蓋 ${stamps.length} 章`, {
      x: MARGIN + 20, y: statsCardY + 18, size: 18, font, color: dark,
    })
    const pct = ((stamps.length / MAX_STAMPS) * 100).toFixed(1)
    page.drawText(`完成度 ${pct}%`, {
      x: W / 2 + 20, y: statsCardY + 18, size: 18, font, color: dark,
    })

    // ── Block 3: Three columns ────────────────────────────────
    const colAreaTop = statsCardY - 24                     // ~643
    const colW = Math.floor((W - MARGIN * 2 - 4) / 3)     // ~171
    const col1X = MARGIN
    const col2X = MARGIN + colW + 2
    const col3X = MARGIN + colW * 2 + 4
    const colTitleY = colAreaTop - 14

    // Column title labels
    page.drawText('離職根因', { x: col1X, y: colTitleY, size: 10, font, color: accent })
    page.drawText('你真正重視的', { x: col2X, y: colTitleY, size: 10, font, color: accent })
    page.drawText('求職方向', { x: col3X, y: colTitleY, size: 10, font, color: accent })

    // Horizontal line below titles
    const titleLineY = colTitleY - 10
    page.drawLine({ start: { x: MARGIN, y: titleLineY }, end: { x: W - MARGIN, y: titleLineY }, thickness: 0.5, color: sepGray })

    // Vertical separators
    const colBottom = 60
    page.drawLine({ start: { x: col2X - 1, y: colAreaTop }, end: { x: col2X - 1, y: colBottom }, thickness: 0.5, color: sepGray })
    page.drawLine({ start: { x: col3X - 1, y: colAreaTop }, end: { x: col3X - 1, y: colBottom }, thickness: 0.5, color: sepGray })

    // Column content (CJK text wrapping)
    const CHARS_PER_LINE = 16
    const LINE_H = 16
    const COL_PAD = 4
    const contentStartY = titleLineY - 16

    const drawColText = (text: string, x: number) => {
      let y = contentStartY
      let line = ''
      for (const char of text) {
        line += char
        if (line.length >= CHARS_PER_LINE) {
          if (y < colBottom) break
          page.drawText(line, { x: x + COL_PAD, y, size: 9.5, font, color: dark })
          y -= LINE_H
          line = ''
        }
      }
      if (line && y >= colBottom) {
        page.drawText(line, { x: x + COL_PAD, y, size: 9.5, font, color: dark })
      }
    }

    drawColText(report.causes, col1X)
    drawColText(report.values, col2X)
    drawColText(report.advice, col3X)

    // ── Footer ────────────────────────────────────────────────
    page.drawLine({ start: { x: MARGIN, y: 48 }, end: { x: W - MARGIN, y: 48 }, thickness: 0.5, color: sepGray })
    page.drawText('由 Cloudflare Workers AI 生成', { x: MARGIN, y: 32, size: 8, font, color: mid })

    const blob = new Blob([await pdfDoc.save()], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'resignation_certificate.pdf'
    link.click()
  }
```

- [ ] **Step 5: 更新 JSX 中的 ProgressSection 呼叫**

將現有：
```tsx
<ProgressSection
  progress={progress}
  stamps={stamps.length}
  maxStamps={MAX_STAMPS}
  onExport={generatePdf}
/>
```

改為：
```tsx
<ProgressSection
  progress={progress}
  stamps={stamps.length}
  maxStamps={MAX_STAMPS}
  onExport={handleExport}
  isExporting={generatingPdf}
/>
```

- [ ] **Step 6: 型別檢查**

```bash
pnpm typecheck 2>&1 | grep -E "Successfully|error"
```

預期：`NX   Successfully ran target typecheck for 5 projects`

- [ ] **Step 7: Commit**

```bash
git add apps/resign-stamp/src/pages/Dashboard.tsx
git commit -m "feat: rewrite generatePdf with A4 minimalist layout and AI career analysis"
```

---

## Task 5: 本地整合驗證

- [ ] **Step 1: 啟動 resign-api**

```bash
cd /home/horus/Desktop/a920604a-labs
CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN .env | cut -d= -f2) \
CLOUDFLARE_ACCOUNT_ID=a0ce05e1163dc5b1c2520a356c47b319 \
pnpm --filter @a920604a/resign-api exec wrangler dev --port 8788
```

預期：`Ready on http://localhost:8788`

- [ ] **Step 2: 啟動前端**

新開終端：
```bash
pnpm --filter @a920604a/root dev
```

- [ ] **Step 3: 驗證匯出流程**

1. 進入離職集章 Dashboard（需先蓋至少 1 章）
2. 點「匯出離職證明 PDF」
3. 按鈕應顯示「生成中…」loading 狀態
4. AI 分析完成後自動下載 `resignation_certificate.pdf`
5. 開啟 PDF 確認：深紅 Header、Stats 卡片、三欄 AI 分析、Footer

- [ ] **Step 4: 再次匯出（驗證快取）**

不關閉頁面，再點一次匯出按鈕，應**不再呼叫** AI（直接用 pdfReport state），生成速度明顯較快。

- [ ] **Step 5: 最終 push**

```bash
git push origin main
```

CI/CD 會自動 deploy resign-api Worker 和前端。
