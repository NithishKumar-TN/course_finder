import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,   // send HTTP-only cookie on every request
});

// ── Response interceptor: redirect to login on 401 ───────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  createSession: (resumeSessionId, forceNew) =>
    api.post("/chat/session", {
      ...(resumeSessionId ? { resumeSessionId } : {}),
      ...(forceNew ? { forceNew: true } : {}),
    }),
  sendMessage: (sessionId, message) =>
    api.post(`/chat/${sessionId}/message`, { message }),
  getSession: (sessionId) => api.get(`/chat/${sessionId}`),
  deleteSession: (sessionId) => api.delete(`/chat/${sessionId}`),
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const roadmapAPI = {
  getRoadmap: (sessionId) => api.get(`/roadmap/${sessionId}`),
  regenerate: (sessionId, data) =>
    api.post(`/roadmap/${sessionId}/regenerate`, data),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressAPI = {
  updateCourse: (sessionId, courseId, data) =>
    api.patch(`/progress/${sessionId}/course/${courseId}`, data),
  getProgress: (sessionId) => api.get(`/progress/${sessionId}`),
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get("/profile"),
  update: (data) => api.patch("/profile", data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getStudents: (params) => api.get("/admin/students", { params }),
  getStudent: (id) => api.get(`/admin/students/${id}`),
  getStudentProgress: (id) => api.get(`/admin/students/${id}/progress`),
  updateStatus: (id, account_status) =>
    api.patch(`/admin/students/${id}/status`, { account_status }),
};

// ── History ───────────────────────────────────────────────────────────────────
export const historyAPI = {
  list: () => api.get("/history"),
  getSession: (sessionId) => api.get(`/history/${sessionId}`),
};

// ── Health ────────────────────────────────────────────────────────────────────
export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
