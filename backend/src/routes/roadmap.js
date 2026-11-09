import express from "express";
import { getSession, updateSession, sessionBelongsToUser } from "../services/dbSessionService.js";
import { buildRoadmap } from "../data/courses.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/roadmap/:sessionId
 */
router.get("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });
  if (!session.roadmap) return res.status(404).json({ error: "Roadmap not yet generated." });
  res.json({ roadmap: session.roadmap, studentProfile: session.studentProfile });
});

/**
 * POST /api/roadmap/:sessionId/regenerate
 */
router.post("/:sessionId/regenerate", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });

  const { interests, skillLevel } = req.body;
  const updatedProfile = {
    ...session.studentProfile,
    ...(interests && { interests }),
    ...(skillLevel && { skillLevel }),
  };

  const roadmap = buildRoadmap(updatedProfile);
  updateSession(req.params.sessionId, { studentProfile: updatedProfile, roadmap });
  res.json({ roadmap, studentProfile: updatedProfile });
});

export default router;
