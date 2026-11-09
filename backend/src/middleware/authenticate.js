import jwt from "jsonwebtoken";
import { getDB } from "../db/database.js";

/**
 * Middleware: verify JWT from HTTP-only cookie.
 * Sets req.user = { id, email, role, full_name } on success.
 */
export function authenticate(req, res, next) {
  const token = req.cookies?.learnmate_token;
  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }

  // Always re-read from DB so deactivated accounts are immediately blocked
  const db = getDB();
  const user = db
    .prepare("SELECT id, full_name, email, role, account_status FROM users WHERE id = ?")
    .get(payload.id);

  if (!user) {
    return res.status(401).json({ error: "User not found." });
  }
  if (user.account_status !== "active") {
    return res.status(403).json({ error: "Account is deactivated. Contact support." });
  }

  req.user = user;
  next();
}

/**
 * Middleware factory: restrict to specific roles.
 * Usage: authorize("admin")  or  authorize("student","admin")
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required." });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied." });
    }
    next();
  };
}
