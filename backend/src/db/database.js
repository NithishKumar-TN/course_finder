import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, "../../../learnmate.db");

let db;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    -- ── Users ────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name     TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'student' CHECK(role IN ('student','admin')),
      account_status TEXT   NOT NULL DEFAULT 'active' CHECK(account_status IN ('active','inactive')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- ── Student profiles ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id         INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      learning_tracks TEXT    DEFAULT '[]',
      skill_level     TEXT,
      learning_goal   TEXT,
      preferences     TEXT    DEFAULT '{}',
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Sessions (chat sessions) ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS sessions (
      id         TEXT    PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stage      TEXT    NOT NULL DEFAULT 'greeting',
      profile_snapshot TEXT DEFAULT '{}',
      roadmap    TEXT    DEFAULT NULL,
      progress   TEXT    DEFAULT '{}',
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

    -- ── Chat messages ─────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS chat_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role       TEXT    NOT NULL CHECK(role IN ('user','assistant','system')),
      content    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user    ON chat_messages(user_id);

    -- ── Roadmaps ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS roadmaps (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      roadmap_data TEXT    NOT NULL DEFAULT '[]',
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);

    -- ── Roadmap versions ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS roadmap_versions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      roadmap_id   INTEGER NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
      version      INTEGER NOT NULL DEFAULT 1,
      roadmap_data TEXT    NOT NULL,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Progress ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS progress (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id    TEXT    NOT NULL,
      status       TEXT    NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','in_progress','completed')),
      rating       INTEGER,
      completed_at TEXT,
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id)
    );
    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);

    -- ── AI memory ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS ai_memory (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id        INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      memory_summary TEXT    NOT NULL DEFAULT '',
      updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Password reset tokens ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT    NOT NULL,
      expires_at TEXT    NOT NULL,
      used_at    TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Assessment history ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS assessment_history (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assessment_data TEXT    NOT NULL DEFAULT '{}',
      score           REAL,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export default getDB;
