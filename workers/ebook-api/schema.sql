-- D1 schema for ebook-api
-- Run: wrangler d1 execute ebook-db --file=schema.sql

CREATE TABLE IF NOT EXISTS books (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '',
  file_url    TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  last_read_time TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);

CREATE TABLE IF NOT EXISTS reading_progress (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id     TEXT NOT NULL,
  user_id     TEXT NOT NULL,
  page_number INTEGER NOT NULL DEFAULT 0,
  total_page  INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_book_user ON reading_progress(book_id, user_id);
