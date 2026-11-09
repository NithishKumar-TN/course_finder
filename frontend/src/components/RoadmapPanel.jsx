import React, { useState } from "react";
import { progressAPI } from "../services/api";

const STATUS_COLORS = {
  not_started: "#8b8fa8",
  in_progress: "#f59e0b",
  completed: "#22c55e",
};

const STATUS_LABELS = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const LEVEL_COLORS = {
  beginner: "#22c55e",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export default function RoadmapPanel({ roadmap, sessionId, onRoadmapUpdate }) {
  const [expandedTrack, setExpandedTrack] = useState(null);
  const [updating, setUpdating] = useState(null);

  if (!roadmap || roadmap.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🗺️</div>
        <h3 style={styles.emptyTitle}>Your roadmap will appear here</h3>
        <p style={styles.emptyText}>
          Chat with LearnMate to discover your personalized learning path
        </p>
      </div>
    );
  }

  const totalModules = roadmap.reduce((s, t) => s + t.modules.length, 0);
  const completedModules = roadmap.reduce(
    (s, t) => s + t.modules.filter((m) => m.status === "completed").length,
    0
  );
  const percent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  async function toggleStatus(module) {
    if (!sessionId) return;
    const nextStatus =
      module.status === "not_started"
        ? "in_progress"
        : module.status === "in_progress"
        ? "completed"
        : "not_started";

    setUpdating(module.id);
    try {
      const { data } = await progressAPI.updateCourse(sessionId, module.id, { status: nextStatus });
      if (onRoadmapUpdate && data.roadmap) onRoadmapUpdate(data.roadmap);
    } catch (_) {}
    setUpdating(null);
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>📚 Your Learning Roadmap</h2>
        <div style={styles.progressRow}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${percent}%` }} />
          </div>
          <span style={styles.progressLabel}>{completedModules}/{totalModules} modules · {percent}%</span>
        </div>
      </div>

      {/* Tracks */}
      <div style={styles.tracks}>
        {roadmap.map((track) => {
          const isOpen = expandedTrack === track.track;
          const done = track.modules.filter((m) => m.status === "completed").length;
          const trackPct = track.modules.length > 0 ? Math.round((done / track.modules.length) * 100) : 0;

          return (
            <div key={track.track} style={styles.trackCard}>
              {/* Track header */}
              <button
                style={styles.trackHeader}
                onClick={() => setExpandedTrack(isOpen ? null : track.track)}
              >
                <div style={styles.trackLeft}>
                  <span style={styles.trackIcon}>{track.icon}</span>
                  <div>
                    <div style={styles.trackName}>{track.track}</div>
                    <div style={styles.trackMeta}>
                      {track.modules.length} modules · ~{track.totalHours}h · {done} completed
                    </div>
                  </div>
                </div>
                <div style={styles.trackRight}>
                  <div style={styles.miniBar}>
                    <div style={{ ...styles.miniBarFill, width: `${trackPct}%` }} />
                  </div>
                  <span style={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Modules list */}
              {isOpen && (
                <div style={styles.modules}>
                  {track.modules.map((module, idx) => (
                    <div key={module.id} style={styles.module}>
                      <div style={styles.moduleLeft}>
                        <div style={styles.moduleIndex}>{idx + 1}</div>
                        <div>
                          <div style={styles.moduleName}>{module.title}</div>
                          <div style={styles.moduleMeta}>
                            <span style={{ ...styles.levelBadge, color: LEVEL_COLORS[module.level] }}>
                              {module.level}
                            </span>
                            <span style={styles.moduleProvider}>{module.provider}</span>
                            <span style={styles.moduleDuration}>⏱ {module.duration}</span>
                            {module.free && <span style={styles.freeBadge}>FREE</span>}
                          </div>
                          <div style={styles.skillTags}>
                            {module.skills.map((s) => (
                              <span key={s} style={styles.skillTag}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div style={styles.moduleRight}>
                        <a
                          href={module.url}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.linkBtn}
                        >
                          Start →
                        </a>
                        <button
                          style={{
                            ...styles.statusBtn,
                            color: STATUS_COLORS[module.status],
                            borderColor: STATUS_COLORS[module.status] + "66",
                          }}
                          onClick={() => toggleStatus(module)}
                          disabled={updating === module.id}
                          title="Click to cycle status"
                        >
                          {updating === module.id ? "…" : STATUS_LABELS[module.status]}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0,
  },
  empty: {
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 12, padding: 40,
    color: "#8b8fa8", textAlign: "center",
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: "#e8eaf0" },
  emptyText: { fontSize: 14, maxWidth: 300, lineHeight: 1.6 },
  header: {
    padding: "20px 24px 16px",
    borderBottom: "1px solid #2d3148", background: "#1a1d27",
    position: "sticky", top: 0, zIndex: 10,
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  progressRow: { display: "flex", alignItems: "center", gap: 12 },
  progressBar: {
    flex: 1, height: 8, background: "#2d3148", borderRadius: 4, overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #22c55e)",
    borderRadius: 4, transition: "width 0.4s ease",
  },
  progressLabel: { fontSize: 13, color: "#8b8fa8", flexShrink: 0 },
  tracks: { padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 },
  trackCard: {
    background: "#242736", border: "1px solid #2d3148",
    borderRadius: 12, overflow: "hidden",
  },
  trackHeader: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 18px", background: "transparent", border: "none",
    color: "#e8eaf0", cursor: "pointer", textAlign: "left", gap: 12,
  },
  trackLeft: { display: "flex", alignItems: "center", gap: 12 },
  trackIcon: { fontSize: 28, flexShrink: 0 },
  trackName: { fontWeight: 600, fontSize: 15 },
  trackMeta: { fontSize: 12, color: "#8b8fa8", marginTop: 2 },
  trackRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  miniBar: { width: 60, height: 5, background: "#1a1d27", borderRadius: 3, overflow: "hidden" },
  miniBarFill: { height: "100%", background: "#6366f1", borderRadius: 3, transition: "width 0.3s" },
  chevron: { fontSize: 12, color: "#8b8fa8" },
  modules: {
    borderTop: "1px solid #2d3148",
    display: "flex", flexDirection: "column",
  },
  module: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "14px 18px", gap: 12,
    borderBottom: "1px solid #1a1d27",
  },
  moduleLeft: { display: "flex", gap: 12, flex: 1 },
  moduleIndex: {
    width: 26, height: 26, borderRadius: "50%",
    background: "#1e2035", border: "1px solid #3d4068",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, color: "#818cf8", flexShrink: 0, marginTop: 2,
  },
  moduleName: { fontWeight: 500, fontSize: 14, marginBottom: 4 },
  moduleMeta: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  levelBadge: { fontSize: 11, fontWeight: 600, textTransform: "uppercase" },
  moduleProvider: { fontSize: 12, color: "#8b8fa8" },
  moduleDuration: { fontSize: 12, color: "#8b8fa8" },
  freeBadge: {
    background: "#14532d", color: "#22c55e",
    borderRadius: 4, padding: "1px 6px", fontSize: 11, fontWeight: 600,
  },
  skillTags: { display: "flex", flexWrap: "wrap", gap: 4 },
  skillTag: {
    background: "#1e2035", border: "1px solid #2d3148",
    color: "#818cf8", borderRadius: 4, padding: "2px 8px", fontSize: 11,
  },
  moduleRight: { display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" },
  linkBtn: {
    background: "linear-gradient(135deg, #0f62fe, #4589ff)",
    color: "#fff", borderRadius: 6, padding: "5px 12px",
    fontSize: 12, fontWeight: 600, textDecoration: "none",
    display: "inline-block",
  },
  statusBtn: {
    background: "transparent", border: "1px solid",
    borderRadius: 20, padding: "3px 10px", fontSize: 11,
    cursor: "pointer", fontWeight: 500,
  },
};
