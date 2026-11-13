import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatPanel({ messages, loading, onSendMessage, stage }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const QUICK_REPLIES = {
    greeting: ["My name is Alex", "My name is Sam", "My name is Priya"],
    interest_assessment: [
      "1. Frontend Development",
      "2. Cybersecurity",
      "3. UI/UX Design",
      "4. Data Science",
      "5. Artificial Intelligence & Machine Learning",
      "6. Cloud Computing",
      "7. Backend Development",
    ],
    skill_assessment: ["1. Beginner", "2. Intermediate", "3. Advanced"],
    goal_collection: [
      "1. Get a job in this field",
      "2. Build my own projects",
      "3. Upskill / career growth",
    ],
  };

  const quickReplies = QUICK_REPLIES[stage] || [];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>🤖</div>
          <div>
            <div style={styles.headerName}>LearnMate AI Coach</div>
            <div style={styles.headerStatus}>
              <span style={styles.statusDot} /> Powered by IBM Granite
            </div>
          </div>
        </div>
        <div style={styles.stageBadge}>{formatStage(stage)}</div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.role === "assistant" && <div style={styles.botAvatar}>🤖</div>}
            <div
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
              }}
            >
              {msg.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={styles.mdP}>{children}</p>,
                    strong: ({ children }) => <strong style={styles.mdStrong}>{children}</strong>,
                    ul: ({ children }) => <ul style={styles.mdUl}>{children}</ul>,
                    li: ({ children }) => <li style={styles.mdLi}>{children}</li>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p style={styles.mdP}>{msg.content}</p>
              )}
              <div style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={styles.botAvatar}>🤖</div>
            <div style={{ ...styles.bubble, ...styles.botBubble }}>
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && !loading && (
        <div style={styles.quickReplies}>
          {quickReplies.map((r) => (
            <button key={r} style={styles.quickBtn} onClick={() => onSendMessage(r)}>
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form style={styles.inputArea} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            loading
              ? "LearnMate is thinking..."
              : stage === "interest_assessment"
              ? "Pick a track above or type any topic (e.g. AI, Flutter, Unity)..."
              : "Type your message…"
          }
          disabled={loading}
        />
        <button
          type="submit"
          style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </form>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#6366f1",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

function formatStage(stage) {
  const map = {
    idle: "Starting…",
    greeting: "Welcome",
    interest_assessment: "Exploring Interests",
    skill_assessment: "Assessing Skills",
    goal_collection: "Setting Goals",
    roadmap_generated: "Roadmap Ready ✓",
    in_progress: "Learning in Progress",
  };
  return map[stage] || stage;
}

const styles = {
  container: {
    display: "flex", flexDirection: "column", height: "100%",
    background: "#1a1d27", borderRadius: 12, overflow: "hidden",
    border: "1px solid #2d3148",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", background: "#242736",
    borderBottom: "1px solid #2d3148",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatar: { fontSize: 28, lineHeight: 1 },
  headerName: { fontWeight: 600, fontSize: 15 },
  headerStatus: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8b8fa8" },
  statusDot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#22c55e" },
  stageBadge: {
    background: "#1e2035", border: "1px solid #3d4068", borderRadius: 20,
    padding: "3px 12px", fontSize: 12, color: "#818cf8",
  },
  messages: {
    flex: 1, overflowY: "auto", padding: "20px 16px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  messageRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  botAvatar: { fontSize: 22, flexShrink: 0, marginBottom: 4 },
  bubble: {
    maxWidth: "78%", padding: "10px 14px", borderRadius: 16,
    fontSize: 14, lineHeight: 1.6,
  },
  userBubble: {
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    color: "#fff", borderBottomRightRadius: 4,
  },
  botBubble: {
    background: "#242736", color: "#e8eaf0",
    border: "1px solid #2d3148", borderBottomLeftRadius: 4,
  },
  timestamp: { fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, textAlign: "right" },
  mdP: { margin: 0, lineHeight: 1.6 },
  mdStrong: { color: "#818cf8" },
  mdUl: { paddingLeft: 18, margin: "4px 0" },
  mdLi: { margin: "2px 0" },
  quickReplies: {
    display: "flex", flexWrap: "wrap", gap: 8,
    padding: "8px 16px", borderTop: "1px solid #2d3148",
  },
  quickBtn: {
    background: "transparent", border: "1px solid #3d4068",
    color: "#818cf8", borderRadius: 20, padding: "5px 14px",
    fontSize: 13, cursor: "pointer", transition: "all 0.15s",
  },
  inputArea: {
    display: "flex", gap: 10, padding: "12px 16px",
    borderTop: "1px solid #2d3148", background: "#1a1d27",
  },
  input: {
    flex: 1, background: "#242736", border: "1px solid #2d3148",
    borderRadius: 24, padding: "10px 18px", color: "#e8eaf0",
    fontSize: 14, outline: "none",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "none", borderRadius: "50%", width: 42, height: 42,
    color: "#fff", fontSize: 16, cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};
