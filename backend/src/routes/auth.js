import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { getDB } from "../db/database.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Stricter rate limit for auth endpoints (5 attempts / 15 min per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function issueToken(res, user) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );

  res.cookie("learnmate_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
}

function safeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req, res, next) => {
  try {
    const { full_name, email, password, confirm_password } = req.body;

    // ── Validation ─────────────────────────────────────────────────────────
    const errors = {};
    if (!full_name || full_name.trim().length < 2)
      errors.full_name = "Full name must be at least 2 characters.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Please enter a valid email address.";
    if (!password || password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (password && !/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      errors.password = "Password must contain at least one uppercase letter and one number.";
    if (password !== confirm_password)
      errors.confirm_password = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: "Validation failed.", errors });
    }

    const db = getDB();

    // ── Duplicate email check ───────────────────────────────────────────────
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        error: "Validation failed.",
        errors: { email: "This email is already registered." },
      });
    }

    // ── Hash password ───────────────────────────────────────────────────────
    const password_hash = await bcrypt.hash(password, 12);

    // ── Insert user + profile in a transaction ──────────────────────────────
    const insert = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO users (full_name, email, password_hash, role, account_status)
           VALUES (?, ?, ?, 'student', 'active')`
        )
        .run(full_name.trim(), email.toLowerCase().trim(), password_hash);

      db.prepare("INSERT INTO student_profiles (user_id) VALUES (?)")
        .run(result.lastInsertRowid);

      db.prepare("INSERT INTO ai_memory (user_id, memory_summary) VALUES (?, '')")
        .run(result.lastInsertRowid);

      return db
        .prepare("SELECT id, full_name, email, role, account_status, created_at FROM users WHERE id = ?")
        .get(result.lastInsertRowid);
    });

    const newUser = insert();
    issueToken(res, newUser);

    return res.status(201).json({
      message: "Account created successfully.",
      user: safeUser(newUser),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = getDB();
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());

    // Use constant-time comparison even if user not found
    const hash = user?.password_hash || "$2a$12$invalidhashpaddingtowastetime000";
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    if (user.account_status !== "active") {
      return res.status(403).json({ error: "Account is deactivated. Contact support." });
    }

    issueToken(res, user);

    // Load profile for the response
    const profile = db
      .prepare("SELECT * FROM student_profiles WHERE user_id = ?")
      .get(user.id);

    return res.json({
      message: "Login successful.",
      user: safeUser(user),
      profile: profile || null,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.clearCookie("learnmate_token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out successfully." });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", authenticate, (req, res) => {
  const db = getDB();
  const profile = db
    .prepare("SELECT * FROM student_profiles WHERE user_id = ?")
    .get(req.user.id);

  // Get latest active session id for this user
  const latestSession = db
    .prepare("SELECT id, stage FROM sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1")
    .get(req.user.id);

  res.json({
    user: safeUser(req.user),
    profile: profile || null,
    latestSession: latestSession || null,
  });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", authLimiter, (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const db = getDB();
    const user = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email.toLowerCase().trim());

    // Always respond the same way — don't leak whether email exists
    if (!user) {
      return res.json({
        message: "If that email is registered, a reset link has been sent.",
        _dev_note: "No email provider configured. Token logged to console in development.",
      });
    }

    // Generate a secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Invalidate old tokens for this user
    db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(user.id);
    db.prepare(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)"
    ).run(user.id, tokenHash, expiresAt);

    // In production, send via email provider. For now, expose in dev only.
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n🔑 Password reset token for ${email}:`);
      console.log(`   http://localhost:5173/reset-password?token=${rawToken}\n`);
    }

    return res.json({
      message: "If that email is registered, a reset link has been sent.",
      ...(process.env.NODE_ENV !== "production" && {
        _dev_reset_url: `http://localhost:5173/reset-password?token=${rawToken}`,
      }),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post("/reset-password", authLimiter, async (req, res, next) => {
  try {
    const { token, password, confirm_password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required." });
    }
    if (password.length < 8 || !/(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
      return res.status(422).json({
        error: "Password must be at least 8 characters with one uppercase letter and one number.",
      });
    }
    if (password !== confirm_password) {
      return res.status(422).json({ error: "Passwords do not match." });
    }

    const db = getDB();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = db
      .prepare(
        `SELECT * FROM password_reset_tokens
         WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')`
      )
      .get(tokenHash);

    if (!record) {
      return res.status(400).json({ error: "Reset link is invalid or has expired." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    db.transaction(() => {
      db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
        .run(password_hash, record.user_id);
      db.prepare("UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?")
        .run(record.id);
    })();

    // Clear auth cookie so user must re-login
    res.clearCookie("learnmate_token", { httpOnly: true, sameSite: "lax" });
    res.json({ message: "Password reset successfully. Please log in with your new password." });
  } catch (err) {
    next(err);
  }
});

export default router;
