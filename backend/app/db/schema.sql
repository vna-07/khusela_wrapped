-- Starter schema (SQLite / libSQL). Expand with the team.
CREATE TABLE IF NOT EXISTS sellers (
  id TEXT PRIMARY KEY,
  phone_hash TEXT UNIQUE NOT NULL,
  business_name TEXT,
  language TEXT DEFAULT 'en',
  consent_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS checks (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES sellers(id),
  module TEXT NOT NULL,
  verdict TEXT NOT NULL,
  reasons_json TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id TEXT,
  event TEXT NOT NULL,
  prev_hash TEXT,
  entry_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS webhook_dedupe (
  message_id TEXT PRIMARY KEY,
  received_at TEXT DEFAULT CURRENT_TIMESTAMP
);
