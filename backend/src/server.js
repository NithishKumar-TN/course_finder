import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes     from "./routes/auth.js";
import chatRoutes     from "./routes/chat.js";
import roadmapRoutes  from "./routes/roadmap.js";
import progressRoutes from "./routes/progress.js";
import profileRoutes  from "./routes/profile.js";
import historyRoutes  from "./routes/history.js";
import adminRoutes    from "./routes/admin.js";
import healthRoutes   from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { getDB } from "./db/database.js";

dotenv.config();

// Initialise DB (creates tables if they don't exist)
getDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & utilities ──────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,   // required for HTTP-only cookies
  })
);

app.use(express.json({ limit: "1mb" }));

// ── Global rate limiting ──────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900_000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/health",   healthRoutes);
app.use("/api/auth",     authRoutes);       // public
app.use("/api/chat",     chatRoutes);       // protected
app.use("/api/roadmap",  roadmapRoutes);    // protected
app.use("/api/progress", progressRoutes);   // protected
app.use("/api/profile",  profileRoutes);    // protected (student)
app.use("/api/history",  historyRoutes);    // protected (student)
app.use("/api/admin",    adminRoutes);      // protected (admin only)

// ── 404 & error handler ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 LearnMate backend running on http://localhost:${PORT}`);
  console.log(`   IBM Granite model : ${process.env.GRANITE_MODEL_ID}`);
  console.log(`   watsonx URL       : ${process.env.WATSONX_URL}`);
  console.log(`   DB path           : ${process.env.DB_PATH || "learnmate.db (default)"}\n`);
});

export default app;
