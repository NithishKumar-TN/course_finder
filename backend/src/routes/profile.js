import express from "express";
import { getDB } from "../db/database.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/profile
 */
router.get("/", (req, res) => {
  const db = getDB();
  const profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);
  res.json({ profile: profile || null });
});

/**
 * PATCH /api/profile
 * Students can update their own profile details.
 */
router.patch("/", (req, res) => {
  const db = getDB();
  const { learning_tracks, skill_level, learning_goal, preferences } = req.body;

  const existing = db.prepare("SELECT user_id FROM student_profiles WHERE user_id = ?").get(req.user.id);
  if (!existing) {
    db.prepare("INSERT INTO student_profiles (user_id) VALUES (?)").run(req.user.id);
  }

  const fields = [];
  const values = [];
  if (learning_tracks !== undefined) { fields.push("learning_tracks = ?"); values.push(JSON.stringify(learning_tracks)); }
  if (skill_level !== undefined) { fields.push("skill_level = ?"); values.push(skill_level); }
  if (learning_goal !== undefined) { fields.push("learning_goal = ?"); values.push(learning_goal); }
  if (preferences !== undefined) { fields.push("preferences = ?"); values.push(JSON.stringify(preferences)); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(req.user.id);
    db.prepare(`UPDATE student_profiles SET ${fields.join(", ")} WHERE user_id = ?`).run(...values);
  }

  const updated = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(req.user.id);
  res.json({ profile: updated });
});

export default router;
