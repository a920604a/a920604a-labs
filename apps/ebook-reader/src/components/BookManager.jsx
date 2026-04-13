import {
  getBooksFromAPI,
  uploadBookToAPI,
  deleteBookFromAPI,
  getReadingProgress as apiGetReadingProgress,
  saveReadingProgress as apiSaveReadingProgress,
} from '../api/ebookApi'

// ── Books ─────────────────────────────────────────────────────────────────────

export const getBooks = async (userId) => {
  try {
    return await getBooksFromAPI(userId)
  } catch (err) {
    console.error('取得書籍失敗:', err)
    return []
  }
}

export const uploadBook = async (book, userId) => {
  try {
    await uploadBookToAPI(book, userId)
  } catch (err) {
    console.error('上傳書籍 metadata 失敗:', err)
  }
}

export const deleteBook = async (bookId, userId) => {
  try {
    await deleteBookFromAPI(bookId, userId)
  } catch (err) {
    console.error('刪除書籍失敗:', err)
  }
}

// ── Reading Progress ──────────────────────────────────────────────────────────

export const getReadingProgress = async (bookId, userId) => {
  try {
    const data = await apiGetReadingProgress(bookId, userId)
    return {
      page_number: data.page_number || 0,
      total_page: data.total_page || 0,
    }
  } catch {
    // Fallback to localStorage if API unavailable (offline)
    const page_number = parseInt(localStorage.getItem(`bookmark-${bookId}`)) || 0
    const total_page = parseInt(localStorage.getItem(`total-pages-${bookId}`)) || 0
    return { page_number, total_page }
  }
}

export const saveReadingProgress = async (userId, bookId, pageNumber, totalPages) => {
  // Persist locally first for instant feedback
  localStorage.setItem(`bookmark-${bookId}`, String(pageNumber))
  localStorage.setItem(`total-pages-${bookId}`, String(totalPages))

  try {
    await apiSaveReadingProgress(bookId, userId, pageNumber, totalPages)
  } catch (err) {
    console.warn('進度同步失敗（已存本地）:', err)
  }
}
