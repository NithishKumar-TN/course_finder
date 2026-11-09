/**
 * DB-backed session service — replaces the in-memory sessionService.
 * Keeps the same exported function signatures so agentService.js is unchanged.
 */
import { getDB } from "../db/database.js";

// ── Session CRUD ──────────────────────────────────────────────────────────────

export function createSession(sessionId, userId) {
  const db = getDB();
  const blank = {
    name: null,
    interests: [],
    skillLevel: null,
    currentSkills: [],
    goals: [],
    learningStyle: null,
    weeklyHours: null,
  };
  db.prepare(`
    INSERT INTO sessions (id, user_id, stage, profile_snapshot, roadmap, progress)
    VALUES (?, ?, 'greeting', ?, NULL, '{}')
  `).run(sessionId, userId, JSON.stringify(blank));

  return _hydrate(sessionId, userId, "greeting", blank, null, {}, []);
}

export function getSession(sessionId) {
  const db = getDB();
  const row = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
  if (!row) return null;

  const messages = db
    .prepare("SELECT role, content, created_at AS timestamp FROM chat_messages WHERE session_id = ? ORDER BY id ASC")
    .all(sessionId);

  return _hydrate(
    sessionId,
    row.user_id,
    row.stage,
    JSON.parse(row.profile_snapshot || "{}"),
    row.roadmap ? JSON.parse(row.roadmap) : null,
    JSON.parse(row.progress || "{}"),
    messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp }))
  );
}

export function updateSession(sessionId, updates) {
  const db = getDB();
  const row = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId);
  if (!row) return null;

  const fields = [];
  const values = [];

  if (updates.stage !== undefined) { fields.push("stage = ?"); values.push(updates.stage); }
  if (updates.studentProfile !== undefined) { fields.push("profile_snapshot = ?"); values.push(JSON.stringify(updates.studentProfile)); }
  if (updates.roadmap !== undefined) { fields.push("roadmap = ?"); values.push(updates.roadmap ? JSON.stringify(updates.roadmap) : null); }
  if (updates.progress !== undefined) { fields.push("progress = ?"); values.push(JSON.stringify(updates.progress)); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(sessionId);
    db.prepare(`UPDATE sessions SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  // Also upsert roadmap into roadmaps table for persistence
  if (updates.roadmap) {
    const existing = db.prepare("SELECT id FROM roadmaps WHERE user_id = ?").get(row.user_id);
    if (existing) {
      // Save version first
      const current = db.prepare("SELECT roadmap_data FROM roadmaps WHERE id = ?").get(existing.id);
      const versionCount = db.prepare("SELECT COUNT(*) AS c FROM roadmap_versions WHERE roadmap_id = ?").get(existing.id).c;
      db.prepare("INSERT INTO roadmap_versions (roadmap_id, version, roadmap_data) VALUES (?, ?, ?)")
        .run(existing.id, versionCount + 1, current.roadmap_data);
      db.prepare("UPDATE roadmaps SET roadmap_data = ?, updated_at = datetime('now') WHERE id = ?")
        .run(JSON.stringify(updates.roadmap), existing.id);
    } else {
      db.prepare("INSERT INTO roadmaps (user_id, roadmap_data) VALUES (?, ?)")
        .run(row.user_id, JSON.stringify(updates.roadmap));
    }
  }

  // Upsert progress rows individually
  if (updates.progress) {
    for (const [courseId, data] of Object.entries(updates.progress)) {
      db.prepare(`
        INSERT INTO progress (user_id, course_id, status, rating, completed_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, course_id) DO UPDATE SET
          status = excluded.status,
          rating = excluded.rating,
          completed_at = CASE WHEN excluded.status = 'completed' AND completed_at IS NULL THEN datetime('now') ELSE completed_at END,
          updated_at = datetime('now')
      `).run(row.user_id, courseId, data.status || "not_started", data.rating || null,
             data.status === "completed" ? new Date().toISOString() : null);
    }
  }

  return getSession(sessionId);
}

export function appendMessage(sessionId, role, content) {
  const db = getDB();
  const row = db.prepare("SELECT user_id FROM sessions WHERE id = ?").get(sessionId);
  if (!row) return;
  db.prepare(
    "INSERT INTO chat_messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)"
  ).run(sessionId, row.user_id, role, content);
}

export function deleteSession(sessionId) {
  const db = getDB();
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
  return true;
}

export function getAllSessions() {
  const db = getDB();
  return db.prepare("SELECT * FROM sessions").all();
}

// ── User-scoped queries ───────────────────────────────────────────────────────

export function getLatestSessionForUser(userId) {
  const db = getDB();
  const row = db
    .prepare("SELECT id FROM sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1")
    .get(userId);
  if (!row) return null;
  return getSession(row.id);
}

export function getSessionsForUser(userId) {
  const db = getDB();
  return db
    .prepare("SELECT id, stage, created_at, updated_at FROM sessions WHERE user_id = ? ORDER BY updated_at DESC")
    .all(userId);
}

export function sessionBelongsToUser(sessionId, userId) {
  const db = getDB();
  const row = db.prepare("SELECT user_id FROM sessions WHERE id = ?").get(sessionId);
  return row?.user_id === userId;
}

// ── Internal helper ───────────────────────────────────────────────────────────

function _hydrate(sessionId, userId, stage, studentProfile, roadmap, progress, conversationHistory) {
  return {
    sessionId,
    userId,
    stage,
    studentProfile,
    roadmap,
    progress,
    conversationHistory,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}
