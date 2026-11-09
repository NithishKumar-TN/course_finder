import express from "express";
import { v4 as uuidv4 } from "uuid";
import { processAgentMessage } from "../services/agentService.js";
import {
  createSession,
  getSession,
  deleteSession,
  getLatestSessionForUser,
} from "../services/dbSessionService.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * POST /api/chat/session
 * Returns the student's most recent in-progress session if one exists,
 * otherwise creates a fresh session.  Returning students are never
 * asked their name / interests again.
 */
router.post("/session", async (req, res, next) => {
  try {
    // ── Resume a specific historical session by ID ────────────────────────
    const { resumeSessionId, forceNew } = req.body || {};
    if (resumeSessionId) {
      const target = getSession(resumeSessionId);
      if (!target) return res.status(404).json({ error: "Session not found." });
      if (target.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });
      return res.status(200).json({
        sessionId: target.sessionId,
        stage: target.stage,
        studentProfile: target.studentProfile,
        roadmap: target.roadmap,
        messages: target.conversationHistory,
        resumed: true,
      });
    }

    // ── Resume existing session (any stage including greeting) ───────────
    const existing = !forceNew && getLatestSessionForUser(req.user.id);

    if (existing && existing.stage !== "greeting") {
      // Returning student with real progress — restore everything
      return res.status(200).json({
        sessionId: existing.sessionId,
        stage: existing.stage,
        studentProfile: existing.studentProfile,
        roadmap: existing.roadmap,
        messages: existing.conversationHistory,
        resumed: true,
      });
    }

    // Reuse an existing greeting-stage session instead of creating another one
    if (existing && existing.stage === "greeting") {
      const initial = await processAgentMessage(
        existing.sessionId,
        "Hello, I want to start learning!"
      );
      return res.status(200).json({
        sessionId: existing.sessionId,
        message: initial.message,
        stage: initial.stage,
        studentProfile: initial.studentProfile,
        roadmap: initial.roadmap,
        messages: [],
        resumed: false,
      });
    }

    // ── Create fresh session (first time ever) ────────────────────────────
    const sessionId = uuidv4();
    createSession(sessionId, req.user.id);

    const initial = await processAgentMessage(
      sessionId,
      "Hello, I want to start learning!"
    );

    res.status(201).json({
      sessionId,
      message: initial.message,
      stage: initial.stage,
      studentProfile: initial.studentProfile,
      roadmap: initial.roadmap,
      messages: [],
      resumed: false,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chat/:sessionId/message
 */
router.post("/:sessionId/message", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found. Please start a new session." });
    }

    // Enforce ownership — session must belong to the authenticated user
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const result = await processAgentMessage(sessionId, message.trim());

    res.json({
      message: result.message,
      stage: result.stage,
      studentProfile: result.studentProfile,
      roadmap: result.roadmap,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/:sessionId
 */
router.get("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });
  res.json(session);
});

/**
 * DELETE /api/chat/:sessionId
 */
router.delete("/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  if (session.userId !== req.user.id) return res.status(403).json({ error: "Access denied." });
  deleteSession(req.params.sessionId);
  res.json({ success: true, message: "Session ended." });
});

export default router;
