import type { Env } from '../index'

export async function handleDailyQuote(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { date } = await req.json() as { date: string }

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
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
