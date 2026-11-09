import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import ChatPanel from "../components/ChatPanel";
import RoadmapPanel from "../components/RoadmapPanel";
import ProfileSidebar from "../components/ProfileSidebar";

export default function TutorPage() {
  const { user, logout, refreshMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const resumeSessionId = location.state?.resumeSessionId ?? null;
  const {
    messages, sessionId, stage, studentProfile,
    roadmap, loading, error, resumed, startSession, sendMessage, resetSession, setRoadmap,
  } = useChat(resumeSessionId);

  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    startSession();
  }, [startSession]);

  // Auto-switch to roadmap tab when one is generated or restored
  useEffect(() => {
    if ((stage === "roadmap_generated" || stage === "in_progress") && roadmap) {
      setTimeout(() => setActiveTab("roadmap"), resumed ? 0 : 1000);
    }
  }, [stage, roadmap, resumed]);

  // Refresh auth context so dashboard profile cards update after session ends
  useEffect(() => {
    return () => { refreshMe(); };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleReset = async () => {
    await resetSession();
    // after reset, force a brand-new session (don't auto-resume the old one)
    await startSession(true);
  };

  return (
    <div style={s.app}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navBrand}>
          <span style={s.navLogo}>🎓</span>
          <span style={s.navTitle}>Learn<span style={s.navAccent}>Mate</span></span>
          <span style={s.navTagline}>AI Tutor</span>
        </div>

        <div style={s.navTabs}>
          <TabBtn active={activeTab === "chat"} onClick={() => setActiveTab("chat")}>💬 Chat</TabBtn>
          <TabBtn active={activeTab === "roadmap"} onClick={() => setActiveTab("roadmap")} badge={roadmap ? "✓" : null}>🗺️ Roadmap</TabBtn>
        </div>

        <div style={s.navRight}>
          <Link to="/dashboard" style={s.dashLink}>← Dashboard</Link>
          <span style={s.ibmPill}>IBM Granite</span>
          <button style={s.resetBtn} onClick={handleReset} title="Start a new session">↺ New Session</button>
          <button style={s.resetBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main layout */}
      <div style={s.main}>
        <aside style={s.sidebar}>
          <ProfileSidebar studentProfile={studentProfile} stage={stage} />
        </aside>

        <main style={s.center}>
          {error && <div style={s.errorBanner}>⚠️ {error}</div>}

          <div style={{ display: activeTab === "chat" ? "flex" : "none", height: "100%", flexDirection: "column" }}>
            <ChatPanel messages={messages} loading={loading} onSendMessage={sendMessage} stage={stage} />
          </div>

          <div style={{ display: activeTab === "roadmap" ? "block" : "none", height: "100%", overflowY: "auto" }}>
            <RoadmapPanel roadmap={roadmap} sessionId={sessionId} onRoadmapUpdate={setRoadmap} />
          </div>
        </main>
      </div>

      <footer style={s.footer}>
        Built for Problem Statement #12 · Powered by IBM Granite (watsonx.ai) on IBM Cloud Lite
      </footer>
    </div>
  );
}

function TabBtn({ children, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "rgba(99,102,241,0.15)" : "transparent",
      border: active ? "1px solid #4f52c9" : "1px solid transparent",
      color: active ? "#818cf8" : "#8b8fa8",
      borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {children}
      {badge && <span style={{ background: "#22c55e", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
    </button>
  );
}

const s = {
  app: { height: "100vh", display: "flex", flexDirection: "column", background: "#0f1117" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, background: "#1a1d27", borderBottom: "1px solid #2d3148", flexShrink: 0 },
  navBrand: { display: "flex", alignItems: "center", gap: 10 },
  navLogo: { fontSize: 24 },
  navTitle: { fontSize: 20, fontWeight: 800, color: "#e8eaf0" },
  navAccent: { color: "#6366f1" },
  navTagline: { fontSize: 11, color: "#8b8fa8", background: "#242736", border: "1px solid #2d3148", borderRadius: 4, padding: "2px 8px" },
  navTabs: { display: "flex", gap: 4 },
  navRight: { display: "flex", alignItems: "center", gap: 10 },
  dashLink: { color: "#818cf8", textDecoration: "none", fontSize: 13 },
  ibmPill: { background: "#0a0f1e", border: "1px solid #0f3566", color: "#4589ff", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 },
  resetBtn: { background: "transparent", border: "1px solid #2d3148", color: "#8b8fa8", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" },
  resumedBanner: { background: "#0d1f0f", border: "none", borderBottom: "1px solid #166534", color: "#4ade80", padding: "8px 24px", fontSize: 13, flexShrink: 0 },
  main: { flex: 1, display: "grid", gridTemplateColumns: "240px 1fr", overflow: "hidden" },
  sidebar: { borderRight: "1px solid #2d3148", background: "#1a1d27", overflow: "hidden" },
  center: { display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" },
  errorBanner: { background: "#2d0d0d", border: "1px solid #ef444444", color: "#fca5a5", padding: "8px 16px", fontSize: 13, flexShrink: 0 },
  footer: { textAlign: "center", fontSize: 11, color: "#57606a", padding: "8px 16px", borderTop: "1px solid #1e2035", background: "#0f1117", flexShrink: 0 },
};
