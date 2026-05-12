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
    console.log('[pdfReport] AI raw response:', raw.slice(0, 400))
    // Extract JSON object from response (handles extra text, markdown fences, etc.)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('no JSON object found')
    const obj = JSON.parse(jsonMatch[0]) as Partial<PdfReportResult>
    console.log('[pdfReport] parsed obj keys:', Object.keys(obj))
    parsed = {
      causes: (typeof obj.causes === 'string' && obj.causes) ? obj.causes : DEFAULT.causes,
      values: (typeof obj.values === 'string' && obj.values) ? obj.values : DEFAULT.values,
      advice: (typeof obj.advice === 'string' && obj.advice) ? obj.advice : DEFAULT.advice,
    }
  } catch (e) {
    console.log('[pdfReport] parse failed:', String(e))
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
