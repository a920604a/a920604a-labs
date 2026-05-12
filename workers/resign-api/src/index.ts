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
      const _uid = await authenticate(req, env, cors)
      if (_uid instanceof Response) return _uid

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
