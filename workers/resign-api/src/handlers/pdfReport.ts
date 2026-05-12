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

const SYSTEM = '你是職涯顧問。用繁體中文，80字以內，只輸出分析內容，不要標題、不要前言、不要編號。'

async function ask(env: Env, prompt: string): Promise<string> {
  const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ],
  }) as { response: string }
  return r.response?.trim() ?? ''
}

export async function handlePdfReport(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { stamps, userName } = await req.json() as { stamps: Stamp[]; userName: string }

  const reasons = stamps.map((s, i) => `${i + 1}. ${s.reason}`).join('\n')
  const ctx = `${userName} 的 ${stamps.length} 筆離職理由：\n${reasons}`

  const [causes, values, advice] = await Promise.all([
    ask(env, `${ctx}\n\n請歸納2-3個核心離職原因類別。`),
    ask(env, `${ctx}\n\n從這些痛點反推：此人真正重視哪些工作條件？`),
    ask(env, `${ctx}\n\n給出具體求職建議：應找什麼樣的公司、應避開什麼、面試時應問什麼。`),
  ])

  const parsed: PdfReportResult = {
    causes: causes || DEFAULT.causes,
    values: values || DEFAULT.values,
    advice: advice || DEFAULT.advice,
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
