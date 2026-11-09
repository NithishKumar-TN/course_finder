import express from "express";
import { getDB } from "../db/database.js";
import { authenticate } from "../middleware/authenticate.js";
import { getSession } from "../services/dbSessionService.js";

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/history
 * List all sessions for the authenticated student with meaningful titles.
 */
router.get("/", (req, res) => {
  const db = getDB();
  const sessions = db.prepare(
    "SELECT id, stage, created_at, updated_at FROM sessions WHERE user_id = ? ORDER BY updated_at DESC"
  ).all(req.user.id);

  // Enrich each session with a human-readable title from last user message
  const enriched = sessions.map((sess) => {
    // Get the last meaningful user message (not the auto-trigger)
    const lastUserMsg = db.prepare(
      `SELECT content FROM chat_messages
       WHERE session_id = ? AND role = 'user'
         AND content != 'Hello, I want to start learning!'
       ORDER BY id DESC LIMIT 1`
    ).get(sess.id);

    // Get message count
    const msgCount = db.prepare(
      "SELECT COUNT(*) AS c FROM chat_messages WHERE session_id = ?"
    ).get(sess.id).c;

    const stageLabels = {
      greeting: "New session",
      interest_assessment: "Choosing a learning track",
      skill_assessment: "Skill assessment",
      goal_collection: "Setting goals",
      roadmap_generated: "Roadmap ready",
      in_progress: "Learning in progress",
    };

    return {
      ...sess,
      title: lastUserMsg
        ? lastUserMsg.content.slice(0, 60) + (lastUserMsg.content.length > 60 ? "…" : "")
        : stageLabels[sess.stage] || sess.stage,
      stage_label: stageLabels[sess.stage] || sess.stage,
      message_count: msgCount,
    };
  });

  res.json({ sessions: enriched });
});

/**
 * GET /api/history/:sessionId
 * Get full conversation history for a specific session (must belong to student).
 */
router.get("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

  res.json({
    sessionId: session.sessionId,
    stage: session.stage,
    studentProfile: session.studentProfile,
    roadmap: session.roadmap,
    messages: session.conversationHistory,
  });
});

export default router;
