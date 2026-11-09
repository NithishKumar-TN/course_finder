import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      return setError("Passwords do not match.");
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, ...form });
      navigate("/login", { state: { message: "Password reset! Please sign in." } });
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={{ color: "#f87171" }}>Invalid or missing reset token.</p>
          <Link to="/forgot-password" style={s.link}>Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🔒</div>
        <h1 style={s.title}>Set new password</h1>
        <form onSubmit={handleSubmit}>
          {error && <div style={s.err}>{error}</div>}
          <input style={s.input} type="password" placeholder="New password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input style={s.input} type="password" placeholder="Confirm password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} required />
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1117", padding: 24 },
  card: { width: "100%", maxWidth: 400, background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 16, padding: "40px 36px", textAlign: "center" },
  logo: { fontSize: 40, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 800, color: "#e8eaf0", marginBottom: 20 },
  input: { width: "100%", padding: "11px 14px", background: "#242736", border: "1px solid #2d3148", borderRadius: 8, color: "#e8eaf0", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 },
  btn: { width: "100%", padding: 12, background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  err: { background: "#2d0d0d", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 },
  link: { color: "#818cf8", fontSize: 13, textDecoration: "none", display: "block", marginTop: 16 },
};
