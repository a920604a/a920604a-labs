/**
 * Cloudflare Worker API client — replaces Supabase for ebook-reader.
 * Worker URL is configured via VITE_EBOOK_API_URL env var.
 *
 * Auth: sends Firebase ID token in Authorization header.
 * Worker verifies token then operates on D1 (metadata) and R2 (PDF files).
 */

import { getFirebaseAuth } from '@a920604a/auth'

const API_URL = import.meta.env.VITE_EBOOK_API_URL as string

async function getIdToken(): Promise<string> {
  const auth = getFirebaseAuth()
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  return user.getIdToken()
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getIdToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`API ${path} failed (${res.status}): ${msg}`)
  }
  return res.json() as Promise<T>
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface Book {
  id: string
  name: string
  category: string
  file_url: string
  user_id: string
  created_at: string
  last_read_time?: string
  // populated client-side from reading_progress
  lastPage?: number
  totalPages?: number
  status?: 'reading' | 'read' | 'unread'
}

export interface ReadingProgress {
  book_id: string
  page_number: number
  total_page: number
}

// ── Book CRUD ────────────────────────────────────────────────────────────────

export async function getBooksFromAPI(userId: string): Promise<Book[]> {
  return apiFetch<Book[]>(`/books?user_id=${userId}`)
}

/** Upload PDF (as base64 data URL) → Worker stores in R2, records in D1 */
export async function uploadBookToAPI(
  book: { id: string; name: string; category: string; data: string },
  userId: string
): Promise<string> {
  const result = await apiFetch<{ file_url: string }>('/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: book.id,
      name: book.name,
      category: book.category,
      data: book.data, // base64 data URL
      user_id: userId,
    }),
  })
  return result.file_url
}

/** Fetch PDF from Worker (auth-protected) → returns a local blob URL for the viewer */
export async function getBookFile(bookId: string): Promise<string> {
  const token = await getIdToken()
  const res = await fetch(`${API_URL}/books/${bookId}/file`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(`File fetch failed (${res.status}): ${msg}`)
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export async function deleteBookFromAPI(bookId: string, userId: string): Promise<void> {
  await apiFetch(`/books/${bookId}?user_id=${userId}`, { method: 'DELETE' })
}

// ── Reading Progress ─────────────────────────────────────────────────────────

export async function getReadingProgress(
  bookId: string,
  userId: string
): Promise<ReadingProgress> {
  return apiFetch<ReadingProgress>(`/progress/${bookId}?user_id=${userId}`)
}

export async function saveReadingProgress(
  bookId: string,
  userId: string,
  pageNumber: number,
  totalPage: number
): Promise<void> {
  await apiFetch(`/progress/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, page_number: pageNumber, total_page: totalPage }),
  })
}
