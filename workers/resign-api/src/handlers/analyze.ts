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
