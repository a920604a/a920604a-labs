# Resign-Stamp Workers AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為離職簽章模組建立 `workers/resign-api` Worker，串接 Cloudflare Workers AI，新增每日 AI 箴言、AI 分析離職故事、AI 潤色蓋章理由三個功能。

**Architecture:** 新建獨立 `workers/resign-api`，使用 Workers AI binding（`@cf/qwen/qwen1.5-14b-chat-awq`），提供三個 REST 端點，Firebase token 驗證邏輯複製自 `workers/ebook-api`。前端三個元件分別串接對應端點。

**Tech Stack:** Cloudflare Workers, Workers AI (`@cf/qwen/qwen1.5-14b-chat-awq`), TypeScript, React, Chakra UI, pdf-lib

---

## File Map

**新建（Worker）：**
- `workers/resign-api/wrangler.toml` — Worker 設定、AI binding
- `workers/resign-api/package.json` — devDeps: wrangler, workers-types, typescript
- `workers/resign-api/tsconfig.json` — 同 ebook-api 模式
- `workers/resign-api/.dev.vars` — 本地開發環境變數
- `workers/resign-api/src/auth.ts` — Firebase token 驗證（複製自 ebook-api）
- `workers/resign-api/src/handlers/dailyQuote.ts` — POST /ai/daily-quote
- `workers/resign-api/src/handlers/polish.ts` — POST /ai/polish
- `workers/resign-api/src/handlers/analyze.ts` — POST /ai/analyze
- `workers/resign-api/src/index.ts` — 路由入口、CORS、錯誤處理

**修改（Frontend）：**
- `apps/resign-stamp/src/components/DailyQuote.tsx` — 動態 AI 箴言
- `apps/resign-stamp/src/components/ReasonModal.tsx` — 加入 AI 潤色 UI
- `apps/resign-stamp/src/pages/Dashboard.tsx` — 加入 AI 分析按鈕 + PDF 修改

**修改（設定）：**
- `.env`（根目錄）— 新增 `VITE_RESIGN_API_URL`
- `.github/workflows/deploy.yml` — 新增 resign-api deploy job
- `README.md` — 更新 Cloudflare 服務表格

---

## Task 1: Scaffold workers/resign-api

**Files:**
- Create: `workers/resign-api/wrangler.toml`
- Create: `workers/resign-api/package.json`
- Create: `workers/resign-api/tsconfig.json`
- Create: `workers/resign-api/.dev.vars`

- [ ] **Step 1: 建立目錄結構**

```bash
mkdir -p workers/resign-api/src/handlers
```

- [ ] **Step 2: 建立 wrangler.toml**

`workers/resign-api/wrangler.toml`:
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

- [ ] **Step 3: 建立 package.json**

`workers/resign-api/package.json`:
```json
{
  "name": "@a920604a/resign-api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev --port 8788",
    "deploy": "wrangler deploy",
    "cf-typegen": "wrangler types"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250409.0",
    "typescript": "~5.8.3",
    "wrangler": "^4.0.0"
  }
}
```

- [ ] **Step 4: 建立 tsconfig.json**

`workers/resign-api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: 建立 .dev.vars**

`workers/resign-api/.dev.vars`:
```
FIREBASE_PROJECT_ID=a920604a-labs
ALLOWED_ORIGINS=http://localhost:5173
```

- [ ] **Step 6: 安裝相依套件**

```bash
cd workers/resign-api && pnpm install
```

預期輸出：`Done in Xs`，`node_modules` 產生。

- [ ] **Step 7: Commit**

```bash
git add workers/resign-api/
git commit -m "feat: scaffold workers/resign-api with Workers AI binding"
```

---

## Task 2: auth.ts — Firebase token 驗證

**Files:**
- Create: `workers/resign-api/src/auth.ts`

- [ ] **Step 1: 複製 ebook-api auth.ts**

`workers/resign-api/src/auth.ts`（完整內容）：
```ts
export async function verifyFirebaseToken(
  token: string,
  projectId: string
): Promise<string> {
  const [headerB64, payloadB64, signatureB64] = token.split('.')
  if (!headerB64 || !payloadB64 || !signatureB64) throw new Error('Invalid token format')

  const header = JSON.parse(b64urlDecode(headerB64))
  if (header.alg !== 'RS256') throw new Error('Unexpected algorithm: ' + header.alg)

  const jwksRes = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
  )
  if (!jwksRes.ok) throw new Error('Failed to fetch Firebase JWK keys')
  const { keys }: { keys: JsonWebKey[] } = await jwksRes.json()

  const jwk = keys.find((k: any) => k.kid === header.kid)
  if (!jwk) throw new Error('Unknown key id: ' + header.kid)

  const pubKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const sig  = b64urlToBuffer(signatureB64)
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', pubKey, sig, data)
  if (!valid) throw new Error('Invalid token signature')

  const payload = JSON.parse(b64urlDecode(payloadB64))
  const now = Math.floor(Date.now() / 1000)

  if (payload.exp < now)         throw new Error('Token expired')
  if (payload.iat > now + 300)   throw new Error('Token issued in the future')
  if (payload.aud !== projectId) throw new Error('Token audience mismatch')
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Token issuer mismatch')

  return payload.sub as string
}

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return atob(b64.padEnd(str.length + ((4 - str.length % 4) % 4), '='))
}

function b64urlToBuffer(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = b64.padEnd(b64.length + ((4 - b64.length % 4) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}
```

- [ ] **Step 2: Commit**

```bash
git add workers/resign-api/src/auth.ts
git commit -m "feat: add Firebase token verification for resign-api"
```

---

## Task 3: POST /ai/daily-quote handler

**Files:**
- Create: `workers/resign-api/src/handlers/dailyQuote.ts`

- [ ] **Step 1: 建立 handler**

`workers/resign-api/src/handlers/dailyQuote.ts`:
```ts
import type { Env } from '../index'

export async function handleDailyQuote(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { date } = await req.json() as { date: string }

  const result = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
    messages: [
      {
        role: 'system',
        content: '你是一個幽默又溫暖的職場心理師，專門幫助想離職的人找到勇氣。',
      },
      {
        role: 'user',
        content: `請為今天（${date}）生成一句繁體中文的離職箴言，30 字以內，帶點哲理或幽默感，不要引號，只輸出句子本身。`,
      },
    ],
  }) as { response: string }

  const quote = result.response?.trim() ?? ''
  return new Response(JSON.stringify({ quote }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add workers/resign-api/src/handlers/dailyQuote.ts
git commit -m "feat: add /ai/daily-quote handler"
```

---

## Task 4: POST /ai/polish handler

**Files:**
- Create: `workers/resign-api/src/handlers/polish.ts`

- [ ] **Step 1: 建立 handler**

`workers/resign-api/src/handlers/polish.ts`:
```ts
import type { Env } from '../index'

export async function handlePolish(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { reason } = await req.json() as { reason: string }

  const result = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
    messages: [
      {
        role: 'system',
        content: '你是一個文字編輯，擅長把口語化的抱怨改寫得更有力道、更有故事感。',
      },
      {
        role: 'user',
        content: `把以下離職原因改寫成一句更有表達力的繁體中文，保留原意，100 字以內，只輸出改寫後的文字：\n"${reason}"`,
      },
    ],
  }) as { response: string }

  const polished = result.response?.trim() ?? ''
  return new Response(JSON.stringify({ polished }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add workers/resign-api/src/handlers/polish.ts
git commit -m "feat: add /ai/polish handler"
```

---

## Task 5: POST /ai/analyze handler

**Files:**
- Create: `workers/resign-api/src/handlers/analyze.ts`

- [ ] **Step 1: 建立 handler**

`workers/resign-api/src/handlers/analyze.ts`:
```ts
import type { Env } from '../index'

interface Stamp {
  index: number
  reason: string
  timestamp: number
}

export async function handleAnalyze(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { stamps } = await req.json() as { stamps: Stamp[] }

  const reasons = stamps
    .map((s, i) => `${i + 1}. ${s.reason}`)
    .join('\n')

  const result = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
    messages: [
      {
        role: 'system',
        content: '你是一個職涯分析師，善於從離職紀錄中找出模式與洞察。',
      },
      {
        role: 'user',
        content: `以下是一個人蓋了 ${stamps.length} 章的離職理由清單：\n${reasons}\n\n請用繁體中文寫一段 150 字以內的分析，找出主要的離職動機類型、情緒模式，最後給一句鼓勵。只輸出分析本文，不要標題。`,
      },
    ],
  }) as { response: string }

  const report = result.response?.trim() ?? ''
  return new Response(JSON.stringify({ report }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add workers/resign-api/src/handlers/analyze.ts
git commit -m "feat: add /ai/analyze handler"
```

---

## Task 6: Worker 入口 index.ts

**Files:**
- Create: `workers/resign-api/src/index.ts`

- [ ] **Step 1: 建立路由入口**

`workers/resign-api/src/index.ts`:
```ts
import { verifyFirebaseToken } from './auth'
import { handleDailyQuote } from './handlers/dailyQuote'
import { handlePolish } from './handlers/polish'
import { handleAnalyze } from './handlers/analyze'

export interface Env {
  AI: Ai
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGINS: string
}

function corsHeaders(origin: string, allowedOrigins: string): HeadersInit {
  const allowed = allowedOrigins.split(',').map((s) => s.trim())
  const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin)
  const isAllowed = isLocalhost || allowed.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

async function authenticate(req: Request, env: Env, cors: HeadersInit): Promise<string | Response> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401, headers: cors })
  try {
    return await verifyFirebaseToken(auth.slice(7), env.FIREBASE_PROJECT_ID)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Forbidden'
    return new Response(msg, { status: 403, headers: cors })
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS ?? '')

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    const url = new URL(req.url)
    const path = url.pathname

    try {
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      if (req.method === 'POST' && path === '/ai/daily-quote') return handleDailyQuote(req, env, cors)
      if (req.method === 'POST' && path === '/ai/polish')      return handlePolish(req, env, cors)
      if (req.method === 'POST' && path === '/ai/analyze')     return handleAnalyze(req, env, cors)

      return new Response('Not Found', { status: 404, headers: cors })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Internal Server Error'
      console.error('Worker error:', msg)
      return new Response(msg, { status: 500, headers: cors })
    }
  },
}
```

- [ ] **Step 2: 型別檢查**

```bash
cd workers/resign-api && pnpm exec tsc --noEmit
```

預期輸出：無錯誤。

- [ ] **Step 3: 本地啟動確認**

確保先 `source .env`，然後：

```bash
cd workers/resign-api && pnpm dev
```

預期輸出：`Ready on http://localhost:8788`

- [ ] **Step 4: Commit**

```bash
git add workers/resign-api/src/index.ts
git commit -m "feat: add resign-api worker router with auth middleware"
```

---

## Task 7: Frontend — DailyQuote.tsx 動態 AI 箴言

**Files:**
- Modify: `apps/resign-stamp/src/components/DailyQuote.tsx`

現有檔案使用硬編碼陣列，整個替換為呼叫 `/ai/daily-quote`。

- [ ] **Step 1: 修改 DailyQuote.tsx**

`apps/resign-stamp/src/components/DailyQuote.tsx`（完整替換）：
```tsx
import { useEffect, useState } from 'react'
import { Box, Flex, Skeleton, Text, useColorModeValue } from '@chakra-ui/react'
import { getAuth } from 'firebase/auth'

const FALLBACK_QUOTES = [
  '離開是為了更好的開始。',
  '每一次結束都是新旅程的起點。',
  '勇敢踏出舒適圈，未來才會精彩。',
  '告別不代表放棄，而是迎接更多可能。',
  '離職，是對夢想的堅持。',
  '人生如章，蓋出屬於自己的篇章。',
  '轉身的背後，是更寬廣的天空。',
  '別忘了，勇氣就是最美的印章。',
  '新的機會，從這一刻開始。',
  '放下過去，擁抱未知。',
]

const RESIGN_API_URL = import.meta.env.VITE_RESIGN_API_URL ?? 'http://localhost:8788'

function getFallbackQuote(): string {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return FALLBACK_QUOTES[seed % FALLBACK_QUOTES.length]
}

export default function DailyQuote() {
  const [quote, setQuote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const token = await getAuth().currentUser?.getIdToken()
        if (!token) throw new Error('no token')

        const today = new Date().toISOString().slice(0, 10)
        const res = await fetch(`${RESIGN_API_URL}/ai/daily-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ date: today }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json() as { quote: string }
        setQuote(data.quote || getFallbackQuote())
      } catch {
        setQuote(getFallbackQuote())
      } finally {
        setLoading(false)
      }
    }
    fetchQuote()
  }, [])

  const bg         = useColorModeValue('orange.50',  'orange.900')
  const border     = useColorModeValue('orange.200', 'orange.700')
  const labelColor = useColorModeValue('orange.500', 'orange.300')
  const textColor  = useColorModeValue('gray.700',   'gray.100')

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderLeft="4px solid"
      borderLeftColor="orange.400"
      borderRadius="xl"
      px={6}
      py={5}
    >
      <Flex align="center" gap={2} mb={2}>
        <Text fontSize="lg">💬</Text>
        <Text fontSize="xs" fontWeight={700} color={labelColor} letterSpacing="widest" textTransform="uppercase">
          每日箴言
        </Text>
      </Flex>
      {loading ? (
        <Skeleton height="28px" borderRadius="md" />
      ) : (
        <Text fontSize={{ base: 'md', md: 'lg' }} fontStyle="italic" fontWeight={500} color={textColor} lineHeight="tall">
          「{quote}」
        </Text>
      )}
    </Box>
  )
}
```

- [ ] **Step 2: 型別檢查**

```bash
pnpm typecheck
```

預期輸出：無錯誤。

- [ ] **Step 3: Commit**

```bash
git add apps/resign-stamp/src/components/DailyQuote.tsx
git commit -m "feat: DailyQuote fetches AI-generated quote with fallback"
```

---

## Task 8: Frontend — ReasonModal.tsx AI 潤色

**Files:**
- Modify: `apps/resign-stamp/src/components/ReasonModal.tsx`

- [ ] **Step 1: 修改 ReasonModal.tsx**

`apps/resign-stamp/src/components/ReasonModal.tsx`（完整替換）：
```tsx
import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react'
import { getAuth } from 'firebase/auth'

const MAX_CHARS = 200
const RESIGN_API_URL = import.meta.env.VITE_RESIGN_API_URL ?? 'http://localhost:8788'

interface ReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  stampIndex?: number
  initialReason?: string
}

export default function ReasonModal({
  isOpen,
  onClose,
  onSubmit,
  stampIndex,
  initialReason = '',
}: ReasonModalProps) {
  const [reason, setReason]           = useState(initialReason)
  const [polished, setPolished]       = useState('')
  const [polishing, setPolishing]     = useState(false)
  const [showPolished, setShowPolished] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason)
      setPolished('')
      setShowPolished(false)
    }
  }, [isOpen, initialReason])

  const handleClose = () => {
    setReason('')
    setPolished('')
    setShowPolished(false)
    onClose()
  }

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason.trim())
      setReason('')
      setPolished('')
      setShowPolished(false)
    }
  }

  const handlePolish = async () => {
    setShowPolished(true)
    setPolishing(true)
    setPolished('')
    try {
      const token = await getAuth().currentUser?.getIdToken()
      if (!token) throw new Error('no token')
      const res = await fetch(`${RESIGN_API_URL}/ai/polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json() as { polished: string }
      setPolished(data.polished ?? '')
    } catch {
      setPolished('')
      setShowPolished(false)
    } finally {
      setPolishing(false)
    }
  }

  const remaining  = MAX_CHARS - reason.length
  const countColor = remaining < 20 ? 'red.400' : useColorModeValue('gray.400', 'gray.500')
  const cardBg     = useColorModeValue('orange.50', 'orange.900')
  const cardBorder = useColorModeValue('orange.200', 'orange.700')

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md" motionPreset="scale">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader
          bgGradient="linear(to-r, red.400, orange.400)"
          color="white"
          py={5}
          px={6}
          fontSize="lg"
          fontWeight={700}
        >
          🔖 蓋第 {stampIndex} 章
          <Text fontSize="sm" fontWeight={400} mt={1} opacity={0.9}>
            請記錄這次想離職的原因
          </Text>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} />

        <ModalBody pt={5} pb={2} px={6}>
          <Textarea
            value={reason}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setReason(e.target.value)
            }}
            placeholder="例如：老闆又在無理取鬧、加班沒有補償、薪水三年沒漲…"
            rows={5}
            resize="none"
            borderRadius="lg"
            focusBorderColor="red.400"
            fontSize="md"
            autoFocus
          />
          <Flex justify="space-between" mt={1} align="center">
            <Button
              size="xs"
              variant="ghost"
              colorScheme="orange"
              onClick={handlePolish}
              isDisabled={reason.trim().length === 0 || polishing}
              isLoading={polishing}
              loadingText="潤色中…"
            >
              ✨ AI 潤色
            </Button>
            <Text fontSize="xs" color={countColor}>
              {remaining} / {MAX_CHARS}
            </Text>
          </Flex>

          {showPolished && (
            <Box
              mt={3}
              p={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderLeft="3px solid"
              borderLeftColor="orange.400"
              borderRadius="lg"
            >
              <Text fontSize="xs" fontWeight={700} color="orange.500" mb={2} textTransform="uppercase" letterSpacing="wider">
                ✨ AI 建議
              </Text>
              {polishing ? (
                <>
                  <Skeleton height="16px" mb={2} />
                  <Skeleton height="16px" width="70%" />
                </>
              ) : (
                <>
                  <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.100')} lineHeight="tall" mb={3}>
                    {polished}
                  </Text>
                  <Flex justify="flex-end">
                    <Button
                      size="xs"
                      colorScheme="orange"
                      variant="outline"
                      borderRadius="md"
                      onClick={() => {
                        if (polished.length <= MAX_CHARS) setReason(polished)
                        setShowPolished(false)
                      }}
                    >
                      用這個 →
                    </Button>
                  </Flex>
                </>
              )}
            </Box>
          )}
        </ModalBody>

        <ModalFooter gap={3} pt={3} pb={5} px={6}>
          <Button variant="ghost" onClick={handleClose} borderRadius="lg">
            取消
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isDisabled={reason.trim().length === 0}
            borderRadius="lg"
            leftIcon={<>🔖</>}
            minW="110px"
          >
            蓋章確認
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
```

- [ ] **Step 2: 型別檢查**

```bash
pnpm typecheck
```

預期輸出：無錯誤。

- [ ] **Step 3: Commit**

```bash
git add apps/resign-stamp/src/components/ReasonModal.tsx
git commit -m "feat: ReasonModal adds AI polish button with side-by-side result"
```

---

## Task 9: Frontend — Dashboard.tsx AI 分析 + PDF 更新

**Files:**
- Modify: `apps/resign-stamp/src/pages/Dashboard.tsx`

- [ ] **Step 1: 修改 Dashboard.tsx**

在現有 `Dashboard.tsx` 做以下三處修改：

**（1）加入 import 和 state：**

在 `import { useAuth, getFirebaseFirestore } from '@a920604a/auth'` 下方加入：
```tsx
import { getAuth } from 'firebase/auth'

const RESIGN_API_URL = import.meta.env.VITE_RESIGN_API_URL ?? 'http://localhost:8788'
```

在 `const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([])` 後加入：
```tsx
const [aiReport, setAiReport]       = useState('')
const [analyzing, setAnalyzing]     = useState(false)
```

**（2）加入 `handleAnalyze` 函式**（放在 `handleAddStamp` 之後）：
```tsx
const handleAnalyze = async () => {
  setAnalyzing(true)
  try {
    const token = await getAuth().currentUser?.getIdToken()
    if (!token) throw new Error('no token')
    const res = await fetch(`${RESIGN_API_URL}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stamps }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json() as { report: string }
    setAiReport(data.report ?? '')
  } catch {
    toast({ title: '分析失敗，請稍後再試', status: 'error', duration: 3000, isClosable: true })
  } finally {
    setAnalyzing(false)
  }
}
```

**（3）修改 `generatePdf`**：在 `page.drawText('離職集章證明報告', ...)` 之前加入 AI 分析段落：

將現有 `generatePdf` 函式中 `page.drawText('離職集章證明報告', ...` 這行之前插入：
```tsx
    // AI 分析段落（如果有的話，放在第一頁最上方）
    let startY = height - 50
    if (aiReport) {
      page.drawText('AI 離職故事分析', { x: 50, y: startY, size: 14, font: customFont, color: rgb(0.8, 0.3, 0) })
      startY -= 25
      const words = aiReport
      let line = ''
      const maxWidth = 70
      for (const char of words) {
        line += char
        if (line.length >= maxWidth) {
          page.drawText(line, { x: 50, y: startY, size: 11, font: customFont })
          startY -= 18
          line = ''
        }
      }
      if (line) {
        page.drawText(line, { x: 50, y: startY, size: 11, font: customFont })
        startY -= 30
      }
    }
```

然後把原本 `page.drawText('離職集章證明報告', { x: 50, y: height - 50, ...` 中的 `height - 50` 改為 `startY`，後續 `height - 80`、`height - 110`、`height - 140`、`height - 170` 分別改為 `startY - 30`、`startY - 60`、`startY - 90`、`startY - 120`，`let y = height - 170` 改為 `let y = startY - 120`。

**（4）在 JSX 中加入分析按鈕和結果卡片**

在 `{/* ── Progress + Stats ────────── */}` 區塊之後、`{/* ── Achievements ─────── */}` 之前插入：

```tsx
{/* ── AI 分析 ─────────────────────────────────────────── */}
<Box>
  <Button
    onClick={handleAnalyze}
    isLoading={analyzing}
    loadingText="分析中…"
    isDisabled={stamps.length === 0}
    colorScheme="orange"
    variant="outline"
    size="sm"
    borderRadius="lg"
    leftIcon={<Text>✨</Text>}
  >
    AI 分析我的離職故事
  </Button>

  {aiReport && (
    <Box
      mt={3}
      bg={useColorModeValue('orange.50', 'orange.900')}
      border="1px solid"
      borderColor={useColorModeValue('orange.200', 'orange.700')}
      borderLeft="4px solid"
      borderLeftColor="orange.400"
      borderRadius="xl"
      px={6}
      py={5}
    >
      <Flex align="center" gap={2} mb={2}>
        <Text fontSize="lg">🧠</Text>
        <Text fontSize="xs" fontWeight={700} color={useColorModeValue('orange.500', 'orange.300')}
          letterSpacing="widest" textTransform="uppercase">
          AI 離職故事分析
        </Text>
      </Flex>
      <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.100')} lineHeight="tall">
        {aiReport}
      </Text>
    </Box>
  )}
</Box>
```

- [ ] **Step 2: 型別檢查**

```bash
pnpm typecheck
```

預期輸出：無錯誤。

- [ ] **Step 3: Commit**

```bash
git add apps/resign-stamp/src/pages/Dashboard.tsx
git commit -m "feat: Dashboard adds AI analyze button and AI-enhanced PDF export"
```

---

## Task 10: 環境變數 + deploy.yml + README

**Files:**
- Modify: `.env`（根目錄）
- Modify: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1: 更新根目錄 .env**

在 `.env` 最後加入：
```
VITE_RESIGN_API_URL=https://resign-api.a920604a.workers.dev
```

- [ ] **Step 2: 更新 deploy.yml**

在 `deploy-ebook-api` job 之後加入新 job：
```yaml
  deploy-resign-api:
    name: Deploy resign-api worker
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Deploy Worker
        working-directory: workers/resign-api
        run: pnpm wrangler deploy --var FIREBASE_PROJECT_ID:${{ secrets.FIREBASE_PROJECT_ID }}
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

同時在 `deploy-root` job 的 Build step 加入：
```yaml
          VITE_RESIGN_API_URL: ${{ secrets.RESIGN_API_URL }}
```

- [ ] **Step 3: 更新 README.md 服務表格**

在 README 的「各模組使用的 Cloudflare 服務」表格中，把離職簽章那行改為：

```
| 離職簽章     | ✓ | ✓ | - | - |
```

並在表格下方的說明更新為：
> 電子書使用 Workers + D1 + R2；離職簽章使用 Workers + Workers AI；其餘兩個模組資料存於 Firebase Firestore。

- [ ] **Step 4: 型別檢查**

```bash
pnpm typecheck
```

預期輸出：無錯誤。

- [ ] **Step 5: Commit**

```bash
git add .env .github/workflows/deploy.yml README.md
git commit -m "chore: add VITE_RESIGN_API_URL, resign-api deploy job, update README"
```

---

## Task 11: 本地端整合驗證

- [ ] **Step 1: 啟動 resign-api Worker**

```bash
source .env
cd workers/resign-api && pnpm dev
# → 應顯示 Ready on http://localhost:8788
```

- [ ] **Step 2: 啟動前端**

新開終端：
```bash
pnpm --filter @a920604a/root dev
# → http://localhost:5173
```

- [ ] **Step 3: 驗證三個功能**

1. 開啟 `http://localhost:5173`，進入離職簽章
2. Dashboard 的「每日箴言」應顯示 Skeleton → 出現 AI 生成的一句話
3. 點擊集章格，ReasonModal 輸入文字後點「✨ AI 潤色」，應出現 AI 建議卡片，點「用這個 →」文字帶入輸入框
4. 蓋章後，點「✨ AI 分析我的離職故事」，應出現分析結果卡片
5. 點「匯出離職證明 PDF」，開啟 PDF 確認第一頁含有 AI 分析段落

- [ ] **Step 4: 最終 commit（如有遺漏的修改）**

```bash
git add -p
git commit -m "fix: resolve any integration issues from local testing"
```
