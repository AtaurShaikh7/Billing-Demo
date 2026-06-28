import { useState, createContext, useContext } from "react";
import { HashRouter as BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentDetail from "./pages/StudentDetail";
import Receipt from "./pages/Receipt";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import "./index.css";

export const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

export const ThemeContext = createContext({ dark: false, toggle: () => {} });
export function useTheme() { return useContext(ThemeContext); }

const SIDEBAR_W = 220;

const NAV = [
  {
    to: "/dashboard", label: "Analytics",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  },
  {
    to: "/students", label: "Students",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  },
  {
    to: "/reports", label: "Reports",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  },
  {
    to: "/settings", label: "Settings",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  },
];

function Sidebar({ open, onToggle, onLogout, dark }) {
  const bg    = dark ? "#000"              : "#020617";
  const divid = dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.08)";

  return (
    <aside style={{
      width: open ? SIDEBAR_W : 0,
      minWidth: open ? SIDEBAR_W : 0,
      background: bg, color: "#fff",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      transition: "width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)",
      overflow: "hidden", flexShrink: 0, zIndex: 100,
    }}>
      {/* Logo row */}
      <div style={{ padding: "16px 14px 14px", borderBottom: `1px solid ${divid}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: SIDEBAR_W }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width:34, height:34, borderRadius:8, flexShrink:0,
            background: "linear-gradient(135deg,#3730a3,#4338ca)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{width:17,height:17}}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#fff", lineHeight:1.2, whiteSpace:"nowrap" }}>Admin Portal</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,.45)", letterSpacing:".5px", textTransform:"uppercase", marginTop:1, whiteSpace:"nowrap" }}>Central Billing Unit</div>
          </div>
        </div>
        <button onClick={onToggle} title="Collapse" style={{
          background:"none", border:"none", cursor:"pointer",
          color:"rgba(255,255,255,.4)", padding:4, borderRadius:6, display:"flex", flexShrink:0,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}>
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"10px 0", minWidth: SIDEBAR_W }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              display:"flex", alignItems:"center", gap:11, padding:"10px 18px",
              color: isActive ? "#fff" : "rgba(255,255,255,.5)",
              textDecoration:"none", fontSize:13.5, fontWeight:500,
              background: isActive ? "#3730a3" : "transparent",
              borderLeft: isActive ? "4px solid #818cf8" : "4px solid transparent",
              transition:"background .15s", whiteSpace:"nowrap",
            })}>
            {item.icon}{item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding:"10px 0", borderTop:`1px solid ${divid}`, minWidth: SIDEBAR_W }}>
        <div style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 18px",
          color:"rgba(255,255,255,.4)", fontSize:13.5, cursor:"pointer", whiteSpace:"nowrap" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Help
        </div>
        <button onClick={onLogout} style={{
          display:"flex", alignItems:"center", gap:11, padding:"10px 18px", width:"100%",
          color:"rgba(255,255,255,.4)", fontSize:13.5,
          background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

function BurgerBtn({ onClick, dark }) {
  return (
    <button onClick={onClick} title="Open navigation" style={{
      width:36, height:36, borderRadius:8, flexShrink:0,
      background: dark ? "#1e1b4b" : "#3730a3",
      border:"none", cursor:"pointer",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap:4, marginRight:12,
    }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ width:16, height:2, background:"#fff", borderRadius:2, display:"block" }}/>
      ))}
    </button>
  );
}

function ProtectedLayout({ onLogout, dark, toggleDark }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isReceipt = location.pathname.startsWith("/receipt");

  const pageBg   = dark ? "#0f1117" : "#f1f5ff";
  const footerBd = dark ? "#1e2030" : "#e0e7ff";
  const footerTx = dark ? "#4b5563" : "#94a3b8";

  if (isReceipt) {
    return (
      <Routes>
        <Route path="/receipt/:studentId/:paymentId" element={<Receipt />} />
      </Routes>
    );
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background: pageBg }}>
      {/* Sidebar — part of flex flow, pushes content */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(false)} onLogout={onLogout} dark={dark} />

      {/* Click-anywhere overlay — sits above main content, below sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:50, cursor:"pointer" }}
          aria-hidden="true"
        />
      )}

      {/* Main — normal stacking, overlay above it catches clicks when sidebar open */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh", minWidth:0, transition:"all .22s" }}>
        {/* Mini topbar — only burger + page title */}
        <div style={{
          height:56, display:"flex", alignItems:"center", padding:"0 28px",
          borderBottom: `1px solid ${footerBd}`,
          background: dark ? "#161822" : "#fff", flexShrink:0, position:"sticky", top:0, zIndex:50,
        }}>
          {!sidebarOpen && <BurgerBtn onClick={() => setSidebarOpen(true)} dark={dark} />}
          <span style={{ fontSize:14, fontWeight:600, color: dark ? "#e0e7ff" : "#3730a3" }}>
            St. Mary Degree College — Billing System
          </span>
        </div>

        <div style={{ padding:"28px 32px", flex:1 }}>
          <Routes>
            <Route path="/dashboard"  element={<Dashboard dark={dark} />} />
            <Route path="/students"   element={<Students dark={dark} />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/reports"    element={<Reports dark={dark} />} />
            <Route path="/settings"   element={<Settings dark={dark} toggleDark={toggleDark} onLogout={onLogout} />} />
            <Route path="/receipt/:studentId/:paymentId" element={<Receipt />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>

        <div style={{
          padding:"13px 32px", borderTop:`1px solid ${footerBd}`,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          fontSize:11.5, color: footerTx,
          background: dark ? "#161822" : "#fff",
        }}>
          <span>© 2026 St. Mary Degree College • System Status: <span style={{color:"#10b981",fontWeight:600}}>Operational</span></span>
          <span style={{cursor:"pointer"}}>PRIVACY POLICY</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("smc_auth"));
  const [dark, setDark]     = useState(() => localStorage.getItem("smc_theme") === "dark");

  function login()  { sessionStorage.setItem("smc_auth","1"); setAuthed(true); }
  function logout() { sessionStorage.removeItem("smc_auth"); setAuthed(false); }
  function toggleDark() {
    setDark(d => {
      const next = !d;
      localStorage.setItem("smc_theme", next ? "dark" : "light");
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      <ThemeContext.Provider value={{ dark, toggle: toggleDark }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={authed ? <Navigate to="/dashboard"/> : <Login dark={dark}/>} />
            <Route path="/*" element={
              authed
                ? <ProtectedLayout onLogout={logout} dark={dark} toggleDark={toggleDark}/>
                : <Navigate to="/login"/>
            }/>
          </Routes>
        </BrowserRouter>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}
