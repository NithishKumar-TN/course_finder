# LearnMate 🎓 — Agentic AI for Personalized Course Pathways

> **Problem Statement #12** | IBM Cloud Lite + IBM Granite (watsonx.ai)

LearnMate is an **Agentic AI learning coach** that holds a guided conversation with students, assesses their interests and skill levels, and dynamically generates a personalized course roadmap — powered by **IBM Granite** via **watsonx.ai on IBM Cloud Lite**.

---

## 🏗 Project Structure

```
learnmate/
├── backend/                        # Node.js + Express API
│   ├── src/
│   │   ├── server.js               # Entry point (ESM)
│   │   ├── db/
│   │   │   ├── database.js         # SQLite init + schema (better-sqlite3)
│   │   │   └── seed.js             # Optional seed data
│   │   ├── routes/
│   │   │   ├── auth.js             # Register · Login · Logout · Me · Forgot/Reset password
│   │   │   ├── chat.js             # Chat session endpoints
│   │   │   ├── roadmap.js          # Roadmap generation / retrieval
│   │   │   ├── progress.js         # Progress tracking + ratings
│   │   │   ├── history.js          # Session history list + detail
│   │   │   ├── profile.js          # Student profile read/update
│   │   │   ├── admin.js            # Admin user management
│   │   │   └── health.js           # Health check
│   │   ├── services/
│   │   │   ├── graniteService.js   # IBM Granite (watsonx.ai) integration
│   │   │   ├── agentService.js     # 5-stage agentic state machine
│   │   │   ├── dbSessionService.js # SQLite-backed session persistence
│   │   │   └── sessionService.js   # In-memory session fallback
│   │   ├── middleware/
│   │   │   ├── authenticate.js     # JWT cookie auth middleware
│   │   │   └── errorHandler.js     # Global error handler
│   │   └── data/
│   │       └── courses.js          # 54-course catalog (6 tracks × 3 levels)
│   ├── .env                        # ⚠️ Your credentials (never commit)
│   └── .env.example                # Template
│
└── frontend/                       # React 18 + Vite SPA
    └── src/
        ├── App.jsx                  # Root layout & routing
        ├── main.jsx                 # Entry point
        ├── index.css                # Global styles
        ├── context/
        │   └── AuthContext.jsx      # Auth state (login · logout · user)
        ├── hooks/
        │   └── useChat.js           # Session & message state hook
        ├── services/
        │   └── api.js               # Axios REST client
        ├── components/
        │   ├── ChatPanel.jsx        # Conversational UI + stage-aware quick replies
        │   ├── RoadmapPanel.jsx     # Learning roadmap viewer
        │   ├── ProfileSidebar.jsx   # Student profile & journey stepper
        │   └── ProtectedRoute.jsx   # Route guard (auth check)
        └── pages/
            ├── LoginPage.jsx        # Login form
            ├── RegisterPage.jsx     # Registration form
            ├── ForgotPasswordPage.jsx
            ├── ResetPasswordPage.jsx
            ├── StudentDashboard.jsx # Main student view
            ├── AdminDashboard.jsx   # Admin user management view
            └── TutorPage.jsx        # Tutor / coaching view
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your credentials:

```env
PORT=5000
NODE_ENV=development

# IBM watsonx.ai credentials (IBM Cloud Lite)
WATSONX_API_KEY=<your IBM Cloud API key>
WATSONX_PROJECT_ID=<your watsonx.ai project ID>
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-3-8b-instruct
IBM_IAM_URL=https://iam.cloud.ibm.com/identity/token

# JWT auth (required — not in .env.example, must be added manually)
JWT_SECRET=<a long random secret string>
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session TTL (seconds)
SESSION_TTL=86400
```

**How to get IBM credentials:**
1. Sign up free at [cloud.ibm.com](https://cloud.ibm.com) (Lite account)
2. Create a **watsonx.ai** service instance
3. Create a **project** in watsonx.ai Studio
4. Copy your **API key** from Manage → Access (IAM) → API Keys
5. Copy your **Project ID** from the project settings

### 3. Start the backend

```bash
npm run dev:backend
# → http://localhost:5000
```

### 4. Start the frontend

```bash
npm run dev:frontend
# → http://localhost:5173
```

---

## 🤖 Agentic AI Flow (5 Stages)

```
Student               LearnMate (IBM Granite)
   │                         │
   │──── Hello ─────────────►│  Stage: greeting
   │◄─── Hi! What's your name?│  Loops until name is extracted
   │                         │
   │──── Frontend Dev ───────►│  Stage: interest_assessment
   │◄─── Great choice! ───────│  Profile: track updated
   │                         │
   │──── Beginner ───────────►│  Stage: skill_assessment
   │◄─── Got it! ─────────────│  Profile: skill_level set
   │                         │
   │──── Get a job ──────────►│  Stage: goal_collection
   │◄─── Roadmap generated! ──│  Roadmap: created & stored
   │                         │
   │──── What next? ─────────►│  Stage: in_progress
   │◄─── Next steps... ───────│  Adaptive coaching continues
```

IBM Granite is called on **every turn** with the full conversation history and a stage-aware system prompt. It generates the natural reply **and** extracts structured profile values from free-form input.

---

## 📚 Learning Tracks

| Track | Courses |
|-------|---------|
| 💻 Frontend Development | 9 (Beginner → Advanced) |
| 🔒 Cybersecurity | 9 (Beginner → Advanced) |
| 🎨 UI/UX Design | 9 (Beginner → Advanced) |
| 📊 Data Science | 9 (Beginner → Advanced) |
| ☁️ Cloud Computing | 9 (Beginner → Advanced) |
| ⚙️ Backend Development | 9 (Beginner → Advanced) |

---

## 🗄 Database Schema (SQLite)

| Table | Purpose |
|-------|---------|
| `users` | Auth accounts (student / admin roles) |
| `student_profiles` | Learning tracks, skill level, goal, preferences |
| `sessions` | Chat sessions with stage + roadmap snapshot |
| `chat_messages` | Full message history per session |
| `roadmaps` | Generated roadmaps with version history |
| `roadmap_versions` | Previous roadmap snapshots |
| `progress` | Per-course status (not_started / in_progress / completed) + rating |
| `ai_memory` | Persistent AI memory summary per user |
| `password_reset_tokens` | Secure password reset flow |
| `assessment_history` | Assessment scores over time |

---

## 🔑 IBM Cloud Integration

| Component | Detail |
|-----------|--------|
| Language Model | IBM Granite `ibm/granite-3-8b-instruct` |
| Platform | IBM watsonx.ai |
| API endpoint | `/ml/v1/text/chat` |
| Auth | IBM Cloud IAM (API Key → Bearer token, auto-refreshed every 55 min) |
| Hosting | IBM Cloud Lite (free tier) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login (sets HTTP-only JWT cookie) |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET`  | `/api/auth/me` | Get current user + profile + latest session |
| `POST` | `/api/auth/forgot-password` | Request password reset token |
| `POST` | `/api/auth/reset-password` | Reset password with token |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST`   | `/api/chat/session` | Start or resume a chat session |
| `POST`   | `/api/chat/:id/message` | Send a message → IBM Granite reply |
| `GET`    | `/api/chat/:id` | Get full session state |
| `DELETE` | `/api/chat/:id` | End / delete a session |

### Roadmap
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/roadmap/:id` | Get generated roadmap |
| `POST` | `/api/roadmap/:id/regenerate` | Regenerate with updated profile |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PATCH`| `/api/progress/:id/course/:cid` | Update course status + rating |
| `GET`  | `/api/progress/:id` | Get progress stats & percentage |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/profile` | Get student profile |
| `PATCH` | `/api/profile` | Update learning tracks, skill level, goal, preferences |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/history` | List all sessions for current user |
| `GET`  | `/api/history/:id` | Get session detail by ID |

### Admin *(admin role required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/api/admin/dashboard` | Platform stats (students, sessions, completions, tracks) |
| `GET`   | `/api/admin/students` | List students (search/filter by name, track, skill level) |
| `GET`   | `/api/admin/students/:id` | Get student detail + sessions + roadmap |
| `GET`   | `/api/admin/students/:id/progress` | Get student course progress stats |
| `PATCH` | `/api/admin/students/:id/status` | Activate / deactivate a student account |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/health` | Service health check |

---

## 🛡 Security

- Passwords hashed with **bcrypt** (12 rounds)
- Auth via **JWT** stored in **HTTP-only cookies** (not localStorage)
- Rate limiting on all auth endpoints (5 attempts / 15 min)
- Session ownership enforced — users can only access their own data
- Helmet.js for HTTP security headers
- CORS restricted to configured origins
- No sensitive PII stored beyond user-provided name

---

## 🧑‍💻 Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install both backend and frontend dependencies |
| `npm run dev:backend` | Start backend in dev mode (nodemon, port 5000) |
| `npm run dev:frontend` | Start frontend in dev mode (Vite, port 5173) |
| `npm run start:backend` | Start backend in production mode |
| `npm run build:frontend` | Build frontend for production |
