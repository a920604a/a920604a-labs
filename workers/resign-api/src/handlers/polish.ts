import type { Env } from '../index'

export async function handlePolish(
  req: Request,
  env: Env,
  cors: HeadersInit
): Promise<Response> {
  const { reason } = await req.json() as { reason: string }

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
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
