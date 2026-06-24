import { useState } from "react";
import { useTheme } from "../App";
import { tok } from "../theme";

const NUM = { fontFamily: "'Roboto', sans-serif" };

const SECTIONS = [
  { id:"about",   label:"About",       icon:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
  { id:"account", label:"Account",     icon:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
  { id:"security",label:"Security",    icon:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
  { id:"appearance",label:"Appearance",icon:<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></> },
];

function PwField({ label, id, value, onChange, T }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label htmlFor={id} style={{ fontSize: 12.5, fontWeight: 600, color: T.text, display: "block", marginBottom: 5 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input id={id} type={show ? "text" : "password"} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "9px 38px 9px 12px", boxSizing: "border-box",
            border: `${focused ? 2 : 1}px solid ${focused ? T.indigo : T.inputBd}`,
            borderRadius: 8, fontSize: 13.5, fontFamily: "inherit",
            background: T.inputBg, color: T.text, outline: "none",
            boxShadow: focused ? `0 0 0 3px ${T.indigoFaint}` : "none",
            transition: "border .15s, box-shadow .15s",
          }} />
        <button type="button" onClick={() => setShow(s => !s)} style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
            {show
              ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Settings({ onLogout }) {
  const { dark, toggle: toggleDark } = useTheme();
  const T = tok(dark);
  const [active, setActive] = useState("about");
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  function handlePwChange(e) {
    e.preventDefault();
    if (!pw.current) { setPwMsg({ ok: false, text: "Enter your current password." }); return; }
    if (pw.newPw.length < 6) { setPwMsg({ ok: false, text: "New password must be at least 6 characters." }); return; }
    if (pw.newPw !== pw.confirm) { setPwMsg({ ok: false, text: "Passwords do not match." }); return; }
    if (pw.current !== "smc@2025") { setPwMsg({ ok: false, text: "Current password is incorrect." }); return; }
    setPwSaving(true);
    setTimeout(() => { setPwMsg({ ok: true, text: "Password updated successfully." }); setPw({ current: "", newPw: "", confirm: "" }); setPwSaving(false); }, 800);
  }

  function InfoRow({ label, value, mono }) {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 13.5, color: T.muted, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, ...(mono ? NUM : {}) }}>{value}</span>
      </div>
    );
  }

  const content = {
    about: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 0 24px", borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg,#3730a3,#4338ca)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ width: 26, height: 26 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text }}>St. Mary Billing System</div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>College Fee Management Platform</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: T.indigoFaint, border: `1px solid ${T.border}`, borderRadius: 6, padding: "3px 8px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.success, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.success }}>Operational</span>
            </div>
          </div>
        </div>
        <InfoRow label="Version"      value="v1.0.0"        mono />
        <InfoRow label="Build Date"   value="24 Jun 2025"   mono />
        <InfoRow label="Environment"  value="Production" />
        <InfoRow label="License"      value="Single Instance" />
        <InfoRow label="Developed by" value="MainlyDigital" />
        <InfoRow label="Contact"      value="info@mainlydigital.in" />
        <div style={{ padding: "13px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, color: T.muted, fontWeight: 500 }}>Academic Year</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, ...NUM }}>2025–26</span>
        </div>
      </div>
    ),

    account: (
      <div>
        {/* Profile card */}
        <div style={{ background: T.indigoFaint, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#3730a3,#4338ca)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>Administrator</div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>admin@stmarymumbra.edu.in</div>
            <div style={{ fontSize: 11.5, color: T.indigo, fontWeight: 600, marginTop: 4 }}>Full Access · Central Billing Unit</div>
          </div>
        </div>
        <InfoRow label="Username"    value="admin" mono />
        <InfoRow label="Role"        value="Administrator" />
        <InfoRow label="College"     value="St. Mary Junior College" />
        <InfoRow label="Location"    value="Mumbra, Thane" />
        <InfoRow label="Email"       value="admin@stmarymumbra.edu.in" />
        <InfoRow label="Last Login"  value="24 Jun 2025, 5:30 PM" mono />
        <InfoRow label="Session"     value="Active" />
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Danger Zone</p>
          <button onClick={onLogout} style={{ padding: "9px 18px", background: `${T.danger}18`, color: T.danger, border: `1px solid ${T.danger}40`, borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Sign Out of System
          </button>
        </div>
      </div>
    ),

    security: (
      <div>
        <p style={{ fontSize: 13.5, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
          Update your login credentials. Current password is required to set a new one.
        </p>
        <form onSubmit={handlePwChange}>
          <PwField T={T} label="Current Password" id="cur" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} />
          <PwField T={T} label="New Password"     id="nw"  value={pw.newPw}   onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} />
          <PwField T={T} label="Confirm New Password" id="cf" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} />
          {pwMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13,
              background: pwMsg.ok ? `${T.success}18` : `${T.danger}18`,
              color: pwMsg.ok ? T.success : T.danger,
              border: `1px solid ${pwMsg.ok ? T.success : T.danger}40`,
            }}>{pwMsg.text}</div>
          )}
          <button type="submit" disabled={pwSaving} style={{ padding: "9px 22px", background: T.indigo, color: "#fff", border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: pwSaving ? .7 : 1 }}>
            {pwSaving ? "Saving…" : "Update Password"}
          </button>
        </form>
        <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Demo Credentials</p>
          <div style={{ background: T.indigoFaint, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: T.muted }}>
            Username: <strong style={{ color: T.text, ...NUM }}>admin</strong> &nbsp;·&nbsp; Password: <strong style={{ color: T.text, ...NUM }}>smc@2025</strong>
          </div>
        </div>
      </div>
    ),

    appearance: (
      <div>
        {/* Theme toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px", background: T.indigoFaint, border: `1px solid ${T.border}`, borderRadius: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: dark ? "#1e2238" : "#fff", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth="2" style={{ width: 20, height: 20 }}>
                {dark
                  ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  : <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>}
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{dark ? "Dark Mode" : "Light Mode"}</div>
              <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                {dark ? "Switch to light theme" : "Switch to dark theme"}
              </div>
            </div>
          </div>
          <button onClick={toggleDark} style={{
            width: 56, height: 30, borderRadius: 999, border: "none", cursor: "pointer",
            background: dark ? T.indigo : T.border, position: "relative", transition: "background .2s", flexShrink: 0,
          }}>
            <span style={{
              position: "absolute", top: 3, left: dark ? 29 : 3,
              width: 24, height: 24, borderRadius: "50%", background: "#fff",
              transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={dark ? "#3730a3" : "#f59e0b"} strokeWidth="2" style={{ width: 12, height: 12 }}>
                {dark
                  ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  : <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></>}
              </svg>
            </span>
          </button>
        </div>

        {/* Theme preview */}
        <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: T.indigo, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#818cf8" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#e0e7ff" }}>Preview — {dark ? "Dark" : "Light"} Theme</span>
          </div>
          <div style={{ padding: 16, background: T.bg }}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>KPI Card Sample</span>
              <span style={{ fontSize: 13, color: T.success, fontWeight: 700, ...NUM }}>₹4,28,000</span>
            </div>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 16px", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.success }} />
              <span style={{ fontSize: 12.5, color: T.muted }}>System Status: </span>
              <span style={{ fontSize: 12.5, color: T.success, fontWeight: 700 }}>Operational</span>
            </div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: T.indigo, margin: 0, letterSpacing: "-.02em" }}>Settings</h2>
        <p style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>Manage your account, preferences, and system information.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left nav */}
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden", position: "sticky", top: 24 }}>
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActive(sec.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", width: "100%",
              background: active === sec.id ? T.indigoFaint : "transparent",
              borderLeft: active === sec.id ? `3px solid ${T.indigo}` : "3px solid transparent",
              border: "none", borderBottom: `1px solid ${T.border}`, cursor: "pointer",
              color: active === sec.id ? T.indigo : T.muted,
              fontSize: 13.5, fontWeight: active === sec.id ? 700 : 500,
              fontFamily: "inherit", textAlign: "left", transition: "all .15s",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>{sec.icon}</svg>
              {sec.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "24px 28px" }}>
          {content[active]}
        </div>
      </div>
    </div>
  );
}
