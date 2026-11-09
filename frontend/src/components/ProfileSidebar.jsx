import React from "react";

export default function ProfileSidebar({ studentProfile, stage }) {
  if (!studentProfile) return null;

  const hasData =
    studentProfile.name ||
    studentProfile.interests?.length > 0 ||
    studentProfile.skillLevel;

  if (!hasData) return null;

  const stageSteps = [
    { key: "greeting", label: "Welcome" },
    { key: "interest_assessment", label: "Interests" },
    { key: "skill_assessment", label: "Skill Level" },
    { key: "goal_collection", label: "Goals" },
    { key: "roadmap_generated", label: "Roadmap" },
    { key: "in_progress", label: "Learning" },
  ];

  const currentStepIndex = stageSteps.findIndex((s) => s.key === stage);

  return (
    <div style={styles.container}>
      {/* Student card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.avatarCircle}>
            {studentProfile.name ? studentProfile.name[0].toUpperCase() : "S"}
          </div>
          <div>
            <div style={styles.studentName}>
              {studentProfile.name || "Student"}
            </div>
            <div style={styles.studentMeta}>
              {studentProfile.skillLevel ? (
                <span style={{ ...styles.levelBadge, ...levelStyle(studentProfile.skillLevel) }}>
                  {studentProfile.skillLevel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Journey progress steps */}
        <div style={styles.steps}>
          {stageSteps.map((step, i) => {
            const done = i < currentStepIndex;
            const active = i === currentStepIndex;
            return (
              <div key={step.key} style={styles.step}>
                <div
                  style={{
                    ...styles.stepDot,
                    background: done ? "#22c55e" : active ? "#6366f1" : "#2d3148",
                    border: active ? "2px solid #818cf8" : "2px solid transparent",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                {i < stageSteps.length - 1 && (
                  <div style={{ ...styles.stepLine, background: done ? "#22c55e44" : "#2d3148" }} />
                )}
                <span
                  style={{
                    ...styles.stepLabel,
                    color: active ? "#e8eaf0" : done ? "#22c55e" : "#8b8fa8",
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interests */}
      {studentProfile.interests?.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>🎯 Learning Interests</div>
          <div style={styles.tags}>
            {studentProfile.interests.map((interest) => (
              <span key={interest} style={styles.interestTag}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {studentProfile.goals?.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>🚀 Goals</div>
          {studentProfile.goals.map((g, i) => (
            <div key={i} style={styles.goalItem}>
              <span style={styles.goalBullet}>→</span> {g}
            </div>
          ))}
        </div>
      )}

      {/* IBM badge */}
      <div style={styles.ibmBadge}>
        <div style={styles.ibmLogo}>IBM</div>
        <div>
          <div style={styles.ibmTitle}>Powered by IBM Granite</div>
          <div style={styles.ibmSub}>watsonx.ai on IBM Cloud Lite</div>
        </div>
      </div>
    </div>
  );
}

function levelStyle(level) {
  const map = {
    beginner: { background: "#14532d", color: "#22c55e" },
    intermediate: { background: "#78350f", color: "#f59e0b" },
    advanced: { background: "#7f1d1d", color: "#ef4444" },
  };
  return map[level] || {};
}

const styles = {
  container: {
    display: "flex", flexDirection: "column", gap: 12,
    height: "100%", overflowY: "auto", padding: "16px",
  },
  card: {
    background: "#242736", border: "1px solid #2d3148",
    borderRadius: 12, padding: "16px",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0,
  },
  studentName: { fontWeight: 600, fontSize: 16 },
  studentMeta: { marginTop: 4 },
  levelBadge: {
    borderRadius: 4, padding: "2px 8px", fontSize: 11,
    fontWeight: 600, textTransform: "capitalize",
  },
  steps: { display: "flex", flexDirection: "column", gap: 0 },
  step: {
    display: "flex", alignItems: "center", gap: 10, position: "relative",
    paddingBottom: 4,
  },
  stepDot: {
    width: 24, height: 24, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0,
    zIndex: 1,
  },
  stepLine: {
    position: "absolute", left: 11, top: 24,
    width: 2, height: "100%", minHeight: 16,
  },
  stepLabel: { fontSize: 13 },
  sectionTitle: { fontWeight: 600, marginBottom: 10, color: "#e8eaf0" },
  tags: { display: "flex", flexWrap: "wrap", gap: 6 },
  interestTag: {
    background: "#1e2035", border: "1px solid #3d4068",
    color: "#818cf8", borderRadius: 20, padding: "4px 12px",
    fontSize: 12, fontWeight: 500,
  },
  goalItem: {
    fontSize: 13, color: "#c4c7d4", lineHeight: 1.7,
  },
  goalBullet: { color: "#6366f1", marginRight: 4 },
  ibmBadge: {
    background: "#0a0f1e", border: "1px solid #0f3566",
    borderRadius: 10, padding: "12px 16px",
    display: "flex", alignItems: "center", gap: 12,
    marginTop: "auto",
  },
  ibmLogo: {
    fontWeight: 900, fontSize: 18, color: "#4589ff",
    letterSpacing: "-0.5px", flexShrink: 0,
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
  },
  ibmTitle: { fontSize: 12, fontWeight: 600, color: "#e8eaf0" },
  ibmSub: { fontSize: 11, color: "#8b8fa8" },
};
