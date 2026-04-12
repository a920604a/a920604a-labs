import { verifyFirebaseToken } from './auth'

export interface Env {
  DB: D1Database
  BOOKS_BUCKET: R2Bucket
  FIREBASE_PROJECT_ID: string
  ALLOWED_ORIGINS: string
}

// ── CORS ──────────────────────────────────────────────────────────────────────

function corsHeaders(origin: string, allowedOrigins: string): HeadersInit {
  const allowed = allowedOrigins.split(',').map((s) => s.trim())
  const isAllowed = allowed.includes(origin) || allowed.includes('*')
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(data: unknown, status = 200, cors: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}

// ── Auth middleware ───────────────────────────────────────────────────────────

async function authenticate(req: Request, env: Env): Promise<string | Response> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 })
  try {
    return await verifyFirebaseToken(auth.slice(7), env.FIREBASE_PROJECT_ID)
  } catch {
    return new Response('Forbidden', { status: 403 })
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') ?? ''
    const cors = corsHeaders(origin, env.ALLOWED_ORIGINS)

    // Preflight
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    const url = new URL(req.url)
    const path = url.pathname

    // ── GET /books ─────────────────────────────────────────────────────────
    if (req.method === 'GET' && path === '/books') {
      const uid = await authenticate(req, env)
      if (uid instanceof Response) return uid

      const userId = url.searchParams.get('user_id')
      if (userId !== uid) return new Response('Forbidden', { status: 403 })

      const { results } = await env.DB.prepare(
        'SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(uid).all()

      return json(results, 200, cors)
    }

    // ── POST /books ────────────────────────────────────────────────────────
    if (req.method === 'POST' && path === '/books') {
      const uid = await authenticate(req, env)
      if (uid instanceof Response) return uid

      const { id, name, category, data, user_id } = await req.json() as {
        id: string; name: string; category: string; data: string; user_id: string
      }
      if (user_id !== uid) return new Response('Forbidden', { status: 403 })

      // Decode base64 data URL → binary
      const base64 = data.split(',')[1]
      const binaryStr = atob(base64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)

      // Upload to R2
      const r2Key = `${uid}/${id}.pdf`
      await env.BOOKS_BUCKET.put(r2Key, bytes, {
        httpMetadata: { contentType: 'application/pdf' },
      })

      // R2 public URL pattern — update to your custom domain if needed
      const fileUrl = `https://pub-${env.BOOKS_BUCKET.toString()}.r2.dev/${r2Key}`

      // Insert into D1
      await env.DB.prepare(
        'INSERT INTO books (id, user_id, name, category, file_url) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, uid, name, category, fileUrl).run()

      return json({ file_url: fileUrl }, 201, cors)
    }

    // ── DELETE /books/:id ──────────────────────────────────────────────────
    const deleteBookMatch = path.match(/^\/books\/([^/]+)$/)
    if (req.method === 'DELETE' && deleteBookMatch) {
      const uid = await authenticate(req, env)
      if (uid instanceof Response) return uid

      const bookId = deleteBookMatch[1]
      const userId = url.searchParams.get('user_id')
      if (userId !== uid) return new Response('Forbidden', { status: 403 })

      // Delete from R2
      await env.BOOKS_BUCKET.delete(`${uid}/${bookId}.pdf`)

      // Delete progress and book record
      await env.DB.prepare('DELETE FROM reading_progress WHERE book_id = ? AND user_id = ?').bind(bookId, uid).run()
      await env.DB.prepare('DELETE FROM books WHERE id = ? AND user_id = ?').bind(bookId, uid).run()

      return json({ ok: true }, 200, cors)
    }

    // ── GET /progress/:bookId ──────────────────────────────────────────────
    const progressMatch = path.match(/^\/progress\/([^/]+)$/)
    if (req.method === 'GET' && progressMatch) {
      const uid = await authenticate(req, env)
      if (uid instanceof Response) return uid

      const bookId = progressMatch[1]
      const userId = url.searchParams.get('user_id')
      if (userId !== uid) return new Response('Forbidden', { status: 403 })

      const row = await env.DB.prepare(
        'SELECT page_number, total_page FROM reading_progress WHERE book_id = ? AND user_id = ?'
      ).bind(bookId, uid).first()

      return json(row ?? { page_number: 0, total_page: 0 }, 200, cors)
    }

    // ── PUT /progress/:bookId ──────────────────────────────────────────────
    if (req.method === 'PUT' && progressMatch) {
      const uid = await authenticate(req, env)
      if (uid instanceof Response) return uid

      const bookId = progressMatch[1]
      const { user_id, page_number, total_page } = await req.json() as {
        user_id: string; page_number: number; total_page: number
      }
      if (user_id !== uid) return new Response('Forbidden', { status: 403 })

      await env.DB.prepare(`
        INSERT INTO reading_progress (book_id, user_id, page_number, total_page, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(book_id, user_id) DO UPDATE SET
          page_number = excluded.page_number,
          total_page  = excluded.total_page,
          updated_at  = excluded.updated_at
      `).bind(bookId, uid, page_number, total_page).run()

      return json({ ok: true }, 200, cors)
    }

    return new Response('Not Found', { status: 404 })
  },
}
