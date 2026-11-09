import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { historyAPI } from "../services/api";

export default function StudentDashboard() {
  const { user, profile, latestSession, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    historyAPI.list().then(({ data }) => setSessions(data.sessions || [])).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const tracks = profile?.learning_tracks ? JSON.parse(profile.learning_tracks) : [];
  const initials = user?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "S";

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>🎓 <span style={s.brandName}>Learn<span style={{ color: "#6366f1" }}>Mate</span></span></div>
        <nav style={s.nav}>
          {[
            { label: "🏠 Dashboard",    to: "/dashboard" },
            { label: "🤖 AI Tutor",     to: "/tutor" },
          ].map(({ label, to }) => (
            <Link key={to} to={to} style={s.navLink}>{label}</Link>
          ))}
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.avatar}>{initials}</div>
          <div>
            <div style={s.userName}>{user?.full_name}</div>
            <div style={s.userEmail}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn} title="Logout">⏏</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.h1}>Welcome back, {user?.full_name?.split(" ")[0]}! 👋</h1>
            <p style={s.sub}>Your personalized learning journey continues here.</p>
          </div>
          <button onClick={() => navigate("/tutor")} style={s.startBtn}>
            🤖 Open AI Tutor
          </button>
        </div>

        {/* Profile cards */}
        <div style={s.grid3}>
          <Card icon="🎯" label="Learning Tracks" value={tracks.length > 0 ? tracks.join(", ") : "Not set yet"} />
          <Card icon="📊" label="Skill Level" value={profile?.skill_level || "Not assessed"} />
          <Card icon="🚀" label="Goal" value={profile?.learning_goal || "Not set yet"} />
        </div>

        {/* Recent sessions */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📋 Recent Learning Sessions</h2>
          {sessions.length === 0 ? (
            <div style={s.emptyBox}>
              <p>No sessions yet.</p>
              <button onClick={() => navigate("/tutor")} style={s.startBtn}>Start your first session →</button>
            </div>
          ) : (
            <div style={s.sessionList}>
              {sessions.map((sess) => (
                <div key={sess.id} style={s.sessionRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.sessionTitle}>{sess.title || formatStage(sess.stage)}</div>
                    <div style={s.sessionMeta}>
                      <span style={s.stagePill}>{sess.stage_label || formatStage(sess.stage)}</span>
                      <span style={s.sessionDate}>{new Date(sess.updated_at).toLocaleDateString()}</span>
                      {sess.message_count > 0 && (
                        <span style={s.sessionDate}>· {sess.message_count} messages</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/tutor", { state: { resumeSessionId: sess.id } })}
                    style={s.resumeBtn}
                  >
                    Resume →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* IBM badge */}
        <div style={s.ibmBadge}>
          <span style={s.ibmLogo}>IBM</span>
          <span style={{ fontSize: 12, color: "#8b8fa8" }}>Powered by IBM Granite · watsonx.ai on IBM Cloud Lite</span>
        </div>
      </main>
    </div>
  );
}

function Card({ icon, label, value }) {
  return (
    <div style={sCard.card}>
      <div style={sCard.icon}>{icon}</div>
      <div style={sCard.label}>{label}</div>
      <div style={sCard.value}>{value}</div>
    </div>
  );
}

function formatStage(stage) {
  const map = { greeting: "Welcome", interest_assessment: "Choosing Track", skill_assessment: "Skill Check", goal_collection: "Goal Setting", roadmap_generated: "Roadmap Ready ✓", in_progress: "Learning in Progress" };
  return map[stage] || stage;
}

const s = {
  page: { display: "flex", height: "100vh", background: "#0f1117", color: "#e8eaf0", fontFamily: "-apple-system,'Segoe UI',system-ui,sans-serif" },
  sidebar: { width: 240, background: "#1a1d27", borderRight: "1px solid #2d3148", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 },
  brand: { fontSize: 18, fontWeight: 800, padding: "0 20px 24px", display: "flex", alignItems: "center", gap: 8 },
  brandName: { color: "#e8eaf0" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" },
  navLink: { color: "#8b8fa8", textDecoration: "none", padding: "10px 12px", borderRadius: 8, fontSize: 14, display: "block" },
  sidebarBottom: { padding: "16px 20px", borderTop: "1px solid #2d3148", display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: "#e8eaf0" },
  userEmail: { fontSize: 11, color: "#8b8fa8" },
  logoutBtn: { marginLeft: "auto", background: "transparent", border: "none", color: "#8b8fa8", cursor: "pointer", fontSize: 16 },
  main: { flex: 1, overflowY: "auto", padding: 32 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 },
  h1: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  sub: { fontSize: 14, color: "#8b8fa8" },
  startBtn: { background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14 },
  emptyBox: { background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 10, padding: 24, textAlign: "center", color: "#8b8fa8", fontSize: 14 },
  sessionList: { display: "flex", flexDirection: "column", gap: 8 },
  sessionRow: { background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sessionTitle: { fontWeight: 600, fontSize: 14, color: "#e8eaf0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  sessionMeta: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  stagePill: { background: "#1e2035", border: "1px solid #2d3148", color: "#818cf8", borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  sessionDate: { fontSize: 12, color: "#8b8fa8" },
  resumeBtn: { background: "transparent", border: "1px solid #3d4068", color: "#818cf8", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13, flexShrink: 0 },
  ibmBadge: { display: "flex", alignItems: "center", gap: 8, color: "#8b8fa8", fontSize: 12 },
  ibmLogo: { fontWeight: 900, color: "#4589ff", fontSize: 14 },
};

const sCard = {
  card: { background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 10, padding: "18px 20px" },
  icon: { fontSize: 24, marginBottom: 8 },
  label: { fontSize: 12, color: "#8b8fa8", marginBottom: 4 },
  value: { fontSize: 14, fontWeight: 600, color: "#e8eaf0" },
};
