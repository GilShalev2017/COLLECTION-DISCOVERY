/**
 * LoginPage
 *
 * Two modes: "login" (email + password) and "register" (full museum setup).
 * Matches the existing dark/gold aesthetic from theme.ts.
 * On success, AuthContext sets the user and App.tsx unmounts this screen.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay for entrance animation
    setTimeout(() => setMounted(true), 50);
  }, []);

  // ── Login state ──────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // ── Register state ───────────────────────────────────────────────────────
  const [registerForm, setRegisterForm] = useState({
    museumName: "",
    museumSlug: "",
    name: "",
    email: "",
    password: "",
  });

  // Auto-generate slug from museum name
  useEffect(() => {
    if (mode === "register") {
      setRegisterForm((f) => ({
        ...f,
        museumSlug: f.museumName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }));
    }
  }, [registerForm.museumName, mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(registerForm);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 30% 60%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 80% 30%, rgba(139,26,26,0.05) 0%, transparent 55%)
          `,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 0.5s ease, transform 0.5s cubic-bezier(.16,1,.3,1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "var(--gold-dim)",
              border: "1px solid var(--border-gold)",
              marginBottom: 16,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                stroke="var(--gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22V12h6v10"
                stroke="var(--gold)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 400,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "0.02em",
            }}
          >
            TEMA Collections
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 6 }}>
            {mode === "login"
              ? "Sign in to your museum workspace"
              : "Create your museum workspace"}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 32,
          }}
        >
          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--surface2)",
              borderRadius: 10,
              padding: 4,
              marginBottom: 28,
              gap: 4,
            }}
          >
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  border: "none",
                  background: mode === m ? "var(--surface)" : "transparent",
                  color: mode === m ? "var(--text)" : "var(--text-dim)",
                  fontSize: 13,
                  fontWeight: mode === m ? 500 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(184,57,46,0.1)",
                border: "1px solid rgba(184,57,46,0.3)",
                borderRadius: 8,
                color: "#E07060",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@museum.org"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  padding: "12px",
                  background: loading ? "var(--gold-dim)" : "var(--gold)",
                  border: "none",
                  borderRadius: 8,
                  color: loading ? "var(--text-dim)" : "#1A1000",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.02em",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Divider label */}
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-dim)",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Museum Details
              </p>
              <div>
                <label style={labelStyle}>Museum Name</label>
                <input
                  type="text"
                  required
                  value={registerForm.museumName}
                  onChange={(e) =>
                    setRegisterForm((f) => ({
                      ...f,
                      museumName: e.target.value,
                    }))
                  }
                  placeholder="The Metropolitan Museum of Art"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Museum Slug</label>
                <input
                  type="text"
                  required
                  value={registerForm.museumSlug}
                  onChange={(e) =>
                    setRegisterForm((f) => ({
                      ...f,
                      museumSlug: e.target.value,
                    }))
                  }
                  placeholder="metropolitan-museum"
                  style={inputStyle}
                />
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    marginTop: 4,
                  }}
                >
                  Unique identifier — auto-generated from name
                </p>
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 16,
                  marginTop: 4,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-dim)",
                    margin: "0 0 16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Your Account
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Jane Smith"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm((f) => ({
                          ...f,
                          email: e.target.value,
                        }))
                      }
                      placeholder="you@museum.org"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      placeholder="Min. 8 characters"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  padding: "12px",
                  background: loading ? "var(--gold-dim)" : "var(--gold)",
                  border: "none",
                  borderRadius: 8,
                  color: loading ? "var(--text-dim)" : "#1A1000",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.02em",
                }}
              >
                {loading ? "Creating workspace…" : "Create Museum Workspace"}
              </button>
            </form>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-dim)",
            marginTop: 20,
          }}
        >
          Discover the Collections — Powered by TEMA
        </p>
      </div>
    </div>
  );
}
