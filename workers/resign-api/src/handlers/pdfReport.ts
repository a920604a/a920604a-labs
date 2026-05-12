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

const SYSTEM = '你是職涯顧問。用繁體中文回答，嚴格限制在60字以內，純文字，不能使用任何markdown符號（不能用**、*、#、-），不要編號，不要標題，直接寫分析內容。'

function stripMarkdown(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')   // emoji (supplementary plane)
    .replace(/[☀-➿⌀-⏿]/g, '') // misc symbols, dingbats
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.+?)\*/g, '$1')        // *italic*
    .replace(/^[*\-#>]+\s*/gm, '')      // list markers, headings (not digits)
    .replace(/`(.+?)`/g, '$1')          // inline code
    .replace(/\n+/g, '，')              // newlines → Chinese comma
    .trim()
    .slice(0, 130)
}

async function ask(env: Env, prompt: string): Promise<string> {
  const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ],
  }) as { response: string }
  return stripMarkdown(r.response?.trim() ?? '')
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
