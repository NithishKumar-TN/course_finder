import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../services/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.getDashboard(),
      adminAPI.getStudents(),
    ]).then(([s, t]) => {
      setStats(s.data);
      setStudents(t.data.students || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    const { data } = await adminAPI.getStudents({ search, track: filterTrack, skillLevel: filterLevel });
    setStudents(data.students || []);
  };

  const toggleStatus = async (id, currentStatus) => {
    const next = currentStatus === "active" ? "inactive" : "active";
    if (!window.confirm(`${next === "inactive" ? "Deactivate" : "Activate"} this account?`)) return;
    await adminAPI.updateStatus(id, next);
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, account_status: next } : s));
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>🎓 <span style={{ color: "#e8eaf0", fontWeight: 800 }}>Learn<span style={{ color: "#6366f1" }}>Mate</span></span></div>
        <div style={s.adminBadge}>Admin Panel</div>
        <nav style={s.nav}>
          <span style={{ ...s.navLink, color: "#e8eaf0", fontWeight: 600 }}>📊 Dashboard</span>
          <span style={s.navLink}>👥 Students</span>
        </nav>
        <div style={s.sidebarBottom}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{user?.full_name}</div>
            <div style={{ fontSize: 11, color: "#8b8fa8" }}>Administrator</div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>⏏</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.header}>
          <h1 style={s.h1}>Admin Dashboard</h1>
        </div>

        {/* Stats */}
        {stats && (
          <div style={s.statsGrid}>
            <StatCard icon="👥" label="Total Students" value={stats.totalStudents} color="#6366f1" />
            <StatCard icon="🟢" label="Active Students" value={stats.activeStudents} color="#22c55e" />
            <StatCard icon="📚" label="Courses Completed" value={stats.totalCompleted} color="#f59e0b" />
            <StatCard icon="🔴" label="Inactive Accounts" value={stats.inactiveStudents} color="#ef4444" />
          </div>
        )}

        {/* Filters */}
        <div style={s.filterRow}>
          <input style={s.filterInput} placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={s.filterInput} value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)}>
            <option value="">All tracks</option>
            {["Frontend Development","Cybersecurity","UI/UX Design","Data Science","Cloud Computing","Backend Development"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select style={s.filterInput} value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button onClick={handleSearch} style={s.searchBtn}>Search</button>
        </div>

        {/* Students table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Name","Email","Registered","Track","Level","Status","Progress","Actions"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.id}>
                  <td style={s.td}>{st.full_name}</td>
                  <td style={s.td}>{st.email}</td>
                  <td style={s.td}>{new Date(st.created_at).toLocaleDateString()}</td>
                  <td style={s.td}>{st.learning_tracks ? JSON.parse(st.learning_tracks).join(", ") || "—" : "—"}</td>
                  <td style={s.td}>{st.skill_level || "—"}</td>
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, background: st.account_status === "active" ? "#14532d" : "#2d0d0d", color: st.account_status === "active" ? "#4ade80" : "#f87171" }}>
                      {st.account_status}
                    </span>
                  </td>
                  <td style={s.td}>{st.percent_complete ?? 0}%</td>
                  <td style={s.td}>
                    <button onClick={() => toggleStatus(st.id, st.account_status)} style={s.actionBtn}>
                      {st.account_status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ ...s.td, textAlign: "center", color: "#8b8fa8" }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 10, padding: "18px 20px" }}>
      <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 12, color: "#8b8fa8", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? "—"}</div>
    </div>
  );
}

const s = {
  page: { display: "flex", height: "100vh", background: "#0f1117", color: "#e8eaf0", fontFamily: "-apple-system,'Segoe UI',system-ui,sans-serif", fontSize: 14 },
  sidebar: { width: 220, background: "#1a1d27", borderRight: "1px solid #2d3148", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 },
  brand: { fontSize: 17, fontWeight: 800, padding: "0 20px 10px", display: "flex", alignItems: "center", gap: 8 },
  adminBadge: { margin: "0 20px 20px", background: "#1e2035", border: "1px solid #3d4068", color: "#818cf8", borderRadius: 6, padding: "3px 10px", fontSize: 12, textAlign: "center" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" },
  navLink: { color: "#8b8fa8", textDecoration: "none", padding: "9px 12px", borderRadius: 8, fontSize: 13, display: "block", cursor: "pointer" },
  sidebarBottom: { padding: "16px 20px", borderTop: "1px solid #2d3148", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoutBtn: { background: "transparent", border: "none", color: "#8b8fa8", cursor: "pointer", fontSize: 16 },
  main: { flex: 1, overflowY: "auto", padding: 32 },
  header: { marginBottom: 24 },
  h1: { fontSize: 22, fontWeight: 800 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 },
  filterRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  filterInput: { background: "#242736", border: "1px solid #2d3148", color: "#e8eaf0", borderRadius: 8, padding: "9px 14px", fontSize: 13, outline: "none" },
  searchBtn: { background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", color: "#fff", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13 },
  tableWrap: { background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 10, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#8b8fa8", borderBottom: "1px solid #2d3148", background: "#242736" },
  td: { padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #1e2035", color: "#c4c7d4" },
  statusBadge: { borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 },
  actionBtn: { background: "transparent", border: "1px solid #3d4068", color: "#818cf8", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
};
