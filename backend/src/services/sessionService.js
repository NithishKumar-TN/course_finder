/**
 * In-memory session store for LearnMate student profiles.
 * In production, replace with Redis or a database.
 */

const sessions = new Map();

export function createSession(sessionId) {
  const session = {
    sessionId,
    createdAt: new Date().toISOString(),
    stage: "greeting",           // greeting | interest_assessment | skill_assessment | roadmap_generated | in_progress
    studentProfile: {
      name: null,
      interests: [],             // e.g. ["Frontend Development", "UI/UX Design"]
      skillLevel: null,          // beginner | intermediate | advanced
      currentSkills: [],         // e.g. ["HTML", "CSS"]
      goals: [],                 // e.g. ["Get a job as a React developer"]
      learningStyle: null,       // visual | reading | project-based
      weeklyHours: null,         // hours per week available
    },
    roadmap: null,
    progress: {},                // { courseId: { completed: bool, rating: 1-5 } }
    conversationHistory: [],
    lastUpdated: new Date().toISOString(),
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  const updated = { ...session, ...updates, lastUpdated: new Date().toISOString() };
  sessions.set(sessionId, updated);
  return updated;
}

export function appendMessage(sessionId, role, content) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.conversationHistory.push({ role, content, timestamp: new Date().toISOString() });
  session.lastUpdated = new Date().toISOString();
}

export function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

export function getAllSessions() {
  return [...sessions.values()];
}
