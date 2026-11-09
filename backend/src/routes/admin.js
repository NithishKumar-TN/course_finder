import express from "express";
import { getDB } from "../db/database.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authenticate.js";

const router = express.Router();
router.use(authenticate, authorize("admin"));

/**
 * GET /api/admin/dashboard
 * Real statistics from the database.
 */
router.get("/dashboard", (req, res) => {
  const db = getDB();

  const totalStudents = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'student'").get().c;
  const activeStudents = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'student' AND account_status = 'active'").get().c;
  const inactiveStudents = totalStudents - activeStudents;
  const totalCompleted = db.prepare("SELECT COUNT(*) AS c FROM progress WHERE status = 'completed'").get().c;
  const totalSessions = db.prepare("SELECT COUNT(*) AS c FROM sessions").get().c;

  // Students by track (parse JSON learning_tracks)
  const profileRows = db.prepare("SELECT learning_tracks FROM student_profiles WHERE learning_tracks IS NOT NULL").all();
  const trackCounts = {};
  for (const row of profileRows) {
    try {
      const tracks = JSON.parse(row.learning_tracks || "[]");
      for (const t of tracks) {
        trackCounts[t] = (trackCounts[t] || 0) + 1;
      }
    } catch (_) {}
  }

  // Students by skill level
  const levelRows = db.prepare(
    "SELECT skill_level, COUNT(*) AS c FROM student_profiles WHERE skill_level IS NOT NULL GROUP BY skill_level"
  ).all();
  const byLevel = Object.fromEntries(levelRows.map((r) => [r.skill_level, r.c]));

  res.json({
    totalStudents,
    activeStudents,
    inactiveStudents,
    totalCompleted,
    totalSessions,
    byTrack: trackCounts,
    byLevel,
  });
});

/**
 * GET /api/admin/students
 * List students with optional search/filter.
 */
router.get("/students", (req, res) => {
  const { search = "", track = "", skillLevel = "" } = req.query;

  const db = getDB();
  let query = `
    SELECT u.id, u.full_name, u.email, u.account_status, u.created_at,
           sp.learning_tracks, sp.skill_level, sp.learning_goal,
           (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'completed') AS completed_courses,
           (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id) AS total_tracked
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE u.role = 'student'
  `;
  const params = [];

  if (search) {
    query += " AND (u.full_name LIKE ? OR u.email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (skillLevel) {
    query += " AND sp.skill_level = ?";
    params.push(skillLevel);
  }
  query += " ORDER BY u.created_at DESC";

  let students = db.prepare(query).all(...params);

  // Filter by track (JSON field, must be done in JS)
  if (track) {
    students = students.filter((s) => {
      try {
        return JSON.parse(s.learning_tracks || "[]").includes(track);
      } catch { return false; }
    });
  }

  // Add percent_complete
  students = students.map((s) => ({
    ...s,
    percent_complete: s.total_tracked > 0
      ? Math.round((s.completed_courses / s.total_tracked) * 100)
      : 0,
  }));

  res.json({ students });
});

/**
 * GET /api/admin/students/:id
 */
router.get("/students/:id", (req, res) => {
  const db = getDB();
  const user = db.prepare(
    `SELECT u.id, u.full_name, u.email, u.account_status, u.created_at,
            sp.learning_tracks, sp.skill_level, sp.learning_goal, sp.preferences
     FROM users u LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE u.id = ? AND u.role = 'student'`
  ).get(req.params.id);
  if (!user) return res.status(404).json({ error: "Student not found." });

  const sessions = db.prepare(
    "SELECT id, stage, created_at, updated_at FROM sessions WHERE user_id = ? ORDER BY updated_at DESC"
  ).all(req.params.id);

  const roadmap = db.prepare(
    "SELECT roadmap_data, updated_at FROM roadmaps WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1"
  ).get(req.params.id);

  res.json({ user, sessions, roadmap: roadmap || null });
});

/**
 * GET /api/admin/students/:id/progress
 */
router.get("/students/:id/progress", (req, res) => {
  const db = getDB();
  const rows = db.prepare(
    "SELECT course_id, status, rating, completed_at, updated_at FROM progress WHERE user_id = ? ORDER BY updated_at DESC"
  ).all(req.params.id);

  const completed = rows.filter((r) => r.status === "completed").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;

  res.json({
    progress: rows,
    stats: { total: rows.length, completed, inProgress },
  });
});

/**
 * PATCH /api/admin/students/:id/status
 */
router.patch("/students/:id/status", (req, res) => {
  const { account_status } = req.body;
  if (!["active", "inactive"].includes(account_status)) {
    return res.status(400).json({ error: "Invalid status. Use 'active' or 'inactive'." });
  }

  const db = getDB();
  const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  if (user.role === "admin") {
    return res.status(403).json({ error: "Cannot deactivate admin accounts through this API." });
  }

  db.prepare(
    "UPDATE users SET account_status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(account_status, req.params.id);

  res.json({ success: true, account_status });
});

export default router;
