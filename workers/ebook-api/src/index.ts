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
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      const userId = url.searchParams.get('user_id')
      if (userId !== uid) return new Response('Forbidden', { status: 403, headers: cors })

      const { results } = await env.DB.prepare(
        'SELECT id, user_id, name, category, created_at, last_read_time FROM books WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(uid).all()

      return json(results, 200, cors)
    }

    // ── POST /books ────────────────────────────────────────────────────────
    // Accepts base64 data URL, uploads PDF binary to R2, records metadata in D1.
    if (req.method === 'POST' && path === '/books') {
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      const { id, name, category, data, user_id } = await req.json() as {
        id: string; name: string; category: string; data: string; user_id: string
      }
      if (user_id !== uid) return new Response('Forbidden', { status: 403, headers: cors })

      // base64 data URL → binary
      const base64 = data.replace(/^data:.+;base64,/, '')
      const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const r2Key = `${uid}/${id}.pdf`

      await env.BOOKS_BUCKET.put(r2Key, binary, {
        httpMetadata: { contentType: 'application/pdf' },
      })

      await env.DB.prepare(
        'INSERT OR REPLACE INTO books (id, user_id, name, category, file_url) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, uid, name, category, r2Key).run()

      return json({ ok: true, file_url: r2Key }, 201, cors)
    }

    // ── GET /books/:id/file ────────────────────────────────────────────────
    // Streams the PDF from R2 after verifying the requester owns the book.
    const fileMatch = path.match(/^\/books\/([^/]+)\/file$/)
    if (req.method === 'GET' && fileMatch) {
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      const bookId = fileMatch[1]
      const row = await env.DB.prepare(
        'SELECT file_url FROM books WHERE id = ? AND user_id = ?'
      ).bind(bookId, uid).first<{ file_url: string }>()

      if (!row?.file_url) return new Response('Not Found', { status: 404, headers: cors })

      const obj = await env.BOOKS_BUCKET.get(row.file_url)
      if (!obj) return new Response('Not Found', { status: 404, headers: cors })

      return new Response(obj.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline',
          ...cors,
        },
      })
    }

    // ── DELETE /books/:id ──────────────────────────────────────────────────
    const deleteBookMatch = path.match(/^\/books\/([^/]+)$/)
    if (req.method === 'DELETE' && deleteBookMatch) {
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      const bookId = deleteBookMatch[1]
      const userId = url.searchParams.get('user_id')
      if (userId !== uid) return new Response('Forbidden', { status: 403, headers: cors })

      // Delete PDF from R2 first
      const bookRow = await env.DB.prepare(
        'SELECT file_url FROM books WHERE id = ? AND user_id = ?'
      ).bind(bookId, uid).first<{ file_url: string }>()
      if (bookRow?.file_url) await env.BOOKS_BUCKET.delete(bookRow.file_url)

      await env.DB.prepare('DELETE FROM reading_progress WHERE book_id = ? AND user_id = ?').bind(bookId, uid).run()
      await env.DB.prepare('DELETE FROM books WHERE id = ? AND user_id = ?').bind(bookId, uid).run()

      return json({ ok: true }, 200, cors)
    }

    // ── GET /progress/:bookId ──────────────────────────────────────────────
    const progressMatch = path.match(/^\/progress\/([^/]+)$/)
    if (req.method === 'GET' && progressMatch) {
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      const bookId = progressMatch[1]
      const userId = url.searchParams.get('user_id')
      if (userId !== uid) return new Response('Forbidden', { status: 403, headers: cors })

      const row = await env.DB.prepare(
        'SELECT page_number, total_page FROM reading_progress WHERE book_id = ? AND user_id = ?'
      ).bind(bookId, uid).first()

      return json(row ?? { page_number: 0, total_page: 0 }, 200, cors)
    }

    // ── PUT /progress/:bookId ──────────────────────────────────────────────
    if (req.method === 'PUT' && progressMatch) {
      const uid = await authenticate(req, env, cors)
      if (uid instanceof Response) return uid

      const bookId = progressMatch[1]
      const { user_id, page_number, total_page } = await req.json() as {
        user_id: string; page_number: number; total_page: number
      }
      if (user_id !== uid) return new Response('Forbidden', { status: 403, headers: cors })

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

    return new Response('Not Found', { status: 404, headers: cors })
  },
}
