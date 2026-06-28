import { useState } from "react";
import { useAuth } from "../App";

const CREDENTIALS = {
  administrator: { id: "admin", password: "smc@2025" },
  management: { id: "manager", password: "smc@2025" },
};

export default function Login() {
  const { login } = useAuth();
  const [role, setRole] = useState("administrator");
  const [form, setForm] = useState({ id: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.id || !form.password) {
      setError("Please enter your ID and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const creds = CREDENTIALS[role];
      if (form.id === creds.id && form.password === creds.password) {
        login();
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 700);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#0d1b3e",
    }}>
      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{
          display: "flex",
          width: "100%",
          maxWidth: 900,
          minHeight: 500,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,.5)",
        }}>

          {/* ---- Left panel: building photo ---- */}
          <div style={{
            flex: "0 0 42%",
            position: "relative",
            background: "linear-gradient(180deg, #0d1b3e 0%, #1a3c6e 60%, #0d1b3e 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: "32px 28px",
            minHeight: 480,
            overflow: "hidden",
          }}>
            {/* Background image (SVG architectural illustration fallback) */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 420 480'%3E%3Crect width='420' height='480' fill='%230d1b3e'/%3E%3C!-- Sky --%3E%3Crect x='0' y='0' width='420' height='240' fill='%23184a8a' opacity='.6'/%3E%3C!-- Ground --%3E%3Crect x='0' y='340' width='420' height='140' fill='%230a2a5e' opacity='.8'/%3E%3C!-- Main building --%3E%3Crect x='60' y='140' width='300' height='200' fill='%23d4c9b0' rx='2'/%3E%3C!-- Windows grid --%3E%3Crect x='80' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='120' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='160' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='200' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='240' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='280' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='320' y='160' width='30' height='25' fill='%2393c6f0' opacity='.9'/%3E%3Crect x='80' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='120' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='160' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='200' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='240' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='280' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='320' y='200' width='30' height='25' fill='%2393c6f0' opacity='.7'/%3E%3Crect x='80' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3Crect x='120' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3Crect x='160' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3Crect x='200' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3Crect x='240' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3Crect x='280' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3Crect x='320' y='240' width='30' height='25' fill='%2393c6f0' opacity='.5'/%3E%3C!-- Entrance --%3E%3Crect x='175' y='290' width='70' height='50' fill='%23b8a98a' rx='1'/%3E%3Crect x='190' y='295' width='18' height='45' fill='%2393c6f0' opacity='.6'/%3E%3Crect x='212' y='295' width='18' height='45' fill='%2393c6f0' opacity='.6'/%3E%3C!-- Roof line --%3E%3Crect x='55' y='135' width='310' height='10' fill='%23b8a98a' rx='1'/%3E%3C!-- Trees --%3E%3Cellipse cx='40' cy='310' rx='28' ry='40' fill='%23234d20' opacity='.8'/%3E%3Cellipse cx='380' cy='305' rx='28' ry='40' fill='%23234d20' opacity='.8'/%3E%3Crect x='35' y='340' width='10' height='30' fill='%23613d1f' opacity='.7'/%3E%3Crect x='375' y='340' width='10' height='30' fill='%23613d1f' opacity='.7'/%3E%3C!-- Overlay gradient --%3E%3Crect width='420' height='480' fill='url(%23grad)'/%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230d1b3e' stop-opacity='.55'/%3E%3Cstop offset='60%25' stop-color='%230d1b3e' stop-opacity='.3'/%3E%3Cstop offset='100%25' stop-color='%230d1b3e' stop-opacity='.85'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />

            {/* College seal top-left */}
            <div style={{ position: "absolute", top: 24, left: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,.1)",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{ width: 28, height: 28 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>

            {/* Login Portal text */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-.3px", lineHeight: 1.2 }}>
                Login Portal
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 6 }}>
                St. Mary Degree College<br />Billing & Fee Management System
              </div>
            </div>
          </div>

          {/* ---- Right panel: form ---- */}
          <div style={{
            flex: 1,
            background: "#fff",
            padding: "44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0d1b3e", margin: 0 }}>System Gateway</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Select your portal to continue.</p>
            </div>

            {/* Role tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[
                { key: "administrator", label: "Administrator Login" },
                { key: "management", label: "Management Login" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setRole(tab.key); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 7,
                    border: "1px solid",
                    borderColor: role === tab.key ? "#0d1b3e" : "#e2e8f0",
                    background: role === tab.key ? "#0d1b3e" : "#fff",
                    color: role === tab.key ? "#fff" : "#64748b",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .15s",
                    fontFamily: "inherit",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#fee2e2", color: "#dc2626", borderRadius: 7,
                padding: "10px 14px", fontSize: 13, marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ID field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", display: "block", marginBottom: 5 }}>
                  Administrator ID or Email
                </label>
                <div style={{ position: "relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                    style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 16, height: 16 }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="admin@university.edu"
                    value={form.id}
                    onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                    autoFocus
                    style={{
                      width: "100%", padding: "10px 12px 10px 36px",
                      border: "1px solid #e2e8f0", borderRadius: 7,
                      fontSize: 13.5, color: "#1e293b", outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0d1b3e"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>Secure Password</label>
                  <button type="button" style={{ background: "none", border: "none", fontSize: 12, color: "#2554a0", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                    Reset Credentials?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                    style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 16, height: 16 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{
                      width: "100%", padding: "10px 12px 10px 36px",
                      border: "1px solid #e2e8f0", borderRadius: 7,
                      fontSize: 13.5, color: "#1e293b", outline: "none",
                      fontFamily: "inherit", boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0d1b3e"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              {/* Remember checkbox */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  style={{ width: 14, height: 14, accentColor: "#0d1b3e", cursor: "pointer" }}
                />
                <label htmlFor="remember" style={{ fontSize: 12.5, color: "#64748b", cursor: "pointer", margin: 0, fontWeight: 400 }}>
                  Maintain active session on this device
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px 16px",
                  background: loading ? "#475569" : "#0d1b3e",
                  color: "#fff", border: "none", borderRadius: 7,
                  fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: ".3px", transition: "background .15s",
                  fontFamily: "inherit",
                }}
              >
                {loading ? "Authenticating…" : "Authenticate Access"}
              </button>
            </form>

            {/* Demo hint */}
            <p style={{ fontSize: 11.5, color: "#94a3b8", textAlign: "center", marginTop: 16 }}>
              Demo: <strong>admin</strong> / <strong>smc@2025</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
        borderTop: "1px solid rgba(255,255,255,.08)",
        fontSize: 11.5, color: "rgba(255,255,255,.4)",
        maxWidth: 900, margin: "0 auto", width: "100%", boxSizing: "border-box",
      }}>
        <span>© 2026 St. Mary Degree College. Authorized Access Only.</span>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ cursor: "pointer" }}>Privacy Policy</span>
          <span style={{ cursor: "pointer" }}>Security Standards</span>
          <span style={{ cursor: "pointer" }}>Terms of Service</span>
        </div>
      </div>
    </div>
  );
}
