import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Defined OUTSIDE the page component so it is never remounted on re-render ──
function Field({ name, label, type = "text", placeholder, autoComplete, value, onChange, error }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        style={{ ...styles.input, ...(error ? { borderColor: "#ef4444" } : {}) }}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
      />
      {error && <p style={styles.fieldError}>{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setErrors({ _global: data?.error || "Registration failed." });
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
        <p style={styles.subtitle}>Create your free learning account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {errors._global && <div style={styles.errorBox}>{errors._global}</div>}

          <Field
            name="full_name"
            label="Full name"
            placeholder="Meera Sharma"
            autoComplete="name"
            value={form.full_name}
            onChange={handleChange}
            error={errors.full_name}
          />
          <Field
            name="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Field
            name="password"
            label="Password"
            type="password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Field
            name="confirm_password"
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            autoComplete="new-password"
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
          />

          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
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
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#c4c7d4", marginBottom: 6 },
  input: {
    width: "100%", padding: "11px 14px",
    background: "#242736", border: "1px solid #2d3148",
    borderRadius: 8, color: "#e8eaf0", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  },
  fieldError: { color: "#f87171", fontSize: 12, marginTop: 4 },
  btn: {
    width: "100%", padding: "12px", marginTop: 8,
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
  link: { color: "#818cf8", fontSize: 13, textDecoration: "none" },
};
