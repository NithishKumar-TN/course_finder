import express from "express";
import { getSession, updateSession } from "../services/dbSessionService.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
router.use(authenticate);

/**
 * PATCH /api/progress/:sessionId/course/:courseId
 */
router.patch("/:sessionId/course/:courseId", (req, res) => {
  const { sessionId, courseId } = req.params;
  const { status, rating } = req.body;

  const session = getSession(sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

  const progress = {
    ...session.progress,
    [courseId]: {
      status: status || "in_progress",
      rating: rating || null,
      updatedAt: new Date().toISOString(),
    },
  };

  let roadmap = session.roadmap;
  if (roadmap) {
    roadmap = roadmap.map((track) => ({
      ...track,
      modules: track.modules.map((m) =>
        m.id === courseId ? { ...m, status: status || "in_progress" } : m
      ),
    }));
  }

  updateSession(sessionId, { progress, roadmap, stage: "in_progress" });
  res.json({ success: true, progress, roadmap });
});

/**
 * GET /api/progress/:sessionId
 */
router.get("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

  const totalCourses = (session.roadmap || []).reduce((s, t) => s + t.modules.length, 0);
  const completed = Object.values(session.progress).filter((p) => p.status === "completed").length;
  const inProgress = Object.values(session.progress).filter((p) => p.status === "in_progress").length;

  res.json({
    progress: session.progress,
    stats: {
      totalCourses,
      completed,
      inProgress,
      notStarted: totalCourses - completed - inProgress,
      percentComplete: totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0,
    },
  });
});

export default router;
