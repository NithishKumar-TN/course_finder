import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🎓</div>
        <h1 style={styles.title}>
          Learn<span style={styles.accent}>Mate</span>
        </h1>
        <p style={styles.subtitle}>Sign in to your learning account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>

        <div style={styles.ibmBadge}>
          <span style={styles.ibmLogo}>IBM</span>
          <span style={styles.ibmText}>Powered by IBM Granite · watsonx.ai</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#0f1117", padding: 24,
  },
  card: {
    width: "100%", maxWidth: 420, background: "#1a1d27",
    border: "1px solid #2d3148", borderRadius: 16,
    padding: "40px 36px", textAlign: "center",
  },
  logo: { fontSize: 44, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 800, color: "#e8eaf0", margin: "0 0 6px" },
  accent: { color: "#6366f1" },
  subtitle: { fontSize: 14, color: "#8b8fa8", marginBottom: 28 },
  form: { textAlign: "left" },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#c4c7d4", marginBottom: 6 },
  input: {
    width: "100%", padding: "11px 14px",
    background: "#242736", border: "1px solid #2d3148",
    borderRadius: 8, color: "#e8eaf0", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  },
  forgotRow: { textAlign: "right", marginBottom: 20, marginTop: -10 },
  link: { color: "#818cf8", fontSize: 13, textDecoration: "none" },
  btn: {
    width: "100%", padding: "12px",
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    border: "none", borderRadius: 8, color: "#fff",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
  },
  errorBox: {
    background: "#2d0d0d", border: "1px solid #ef4444",
    color: "#fca5a5", padding: "10px 14px",
    borderRadius: 8, fontSize: 13, marginBottom: 16,
  },
  switchText: { color: "#8b8fa8", fontSize: 13, marginTop: 22 },
  ibmBadge: {
    marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, color: "#8b8fa8", fontSize: 12,
  },
  ibmLogo: { fontWeight: 900, color: "#4589ff", fontSize: 14 },
  ibmText: {},
};
