import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.forgotPassword(email);
      setSent(true);
      if (data._dev_reset_url) setDevUrl(data._dev_reset_url);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🔑</div>
        <h1 style={s.title}>Reset password</h1>
        {sent ? (
          <div>
            <p style={s.success}>
              ✅ If that email is registered, a reset link was sent.
            </p>
            {devUrl && (
              <div style={s.devBox}>
                <p style={{ fontSize: 12, color: "#8b8fa8", marginBottom: 6 }}>
                  Dev mode — reset link:
                </p>
                <a href={devUrl} style={s.devLink}>{devUrl}</a>
              </div>
            )}
            <Link to="/login" style={s.backLink}>← Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={s.sub}>Enter your email and we'll send a reset link.</p>
            {error && <div style={s.err}>{error}</div>}
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <Link to="/login" style={s.backLink}>← Back to login</Link>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1117", padding: 24 },
  card: { width: "100%", maxWidth: 400, background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 16, padding: "40px 36px", textAlign: "center" },
  logo: { fontSize: 40, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 800, color: "#e8eaf0", marginBottom: 8 },
  sub: { fontSize: 14, color: "#8b8fa8", marginBottom: 20 },
  input: { width: "100%", padding: "11px 14px", background: "#242736", border: "1px solid #2d3148", borderRadius: 8, color: "#e8eaf0", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 },
  btn: { width: "100%", padding: 12, background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  err: { background: "#2d0d0d", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 },
  success: { color: "#4ade80", fontSize: 14, marginBottom: 16 },
  devBox: { background: "#1e2035", border: "1px solid #2d3148", borderRadius: 8, padding: 12, marginBottom: 16, wordBreak: "break-all" },
  devLink: { color: "#818cf8", fontSize: 12 },
  backLink: { display: "block", marginTop: 18, color: "#818cf8", fontSize: 13, textDecoration: "none" },
};
