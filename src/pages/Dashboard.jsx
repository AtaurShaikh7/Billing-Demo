import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../data/students";
import { useTheme } from "../App";
import { tok } from "../theme";

const NUM = { fontFamily: "'Roboto', sans-serif" };
function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

function KpiCard({ label, value, trend, trendUp, sub, progress, sparkline, icon, dangerCard, T }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 16, padding: 24,
      boxShadow: T.shadow,
      border: dangerCard ? `1px solid ${T.danger}40` : `1px solid ${T.border}`,
      borderLeft: dangerCard ? `4px solid ${T.danger}` : undefined,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <span style={{ fontSize:10, fontWeight:700, color:T.kpiLabel, textTransform:"uppercase", letterSpacing:".1em" }}>
          {label}
        </span>
        {icon}
      </div>
      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom: (sub || progress !== undefined || sparkline) ? 10 : 0 }}>
        <h3 style={{ fontSize:24, fontWeight:700, color:T.kpiValue, margin:0, ...NUM }}>{value}</h3>
        {trend && (
          <span style={{ fontSize:12, fontWeight:600, color: trendUp ? T.success : T.danger, display:"flex", alignItems:"center", gap:2 }}>
            {trendUp ? "▲" : "▼"}<span style={NUM}>{trend}</span>
          </span>
        )}
        {dangerCard && <span style={{ fontSize:9, fontWeight:700, background:`${T.danger}20`, color:T.danger, padding:"2px 6px", borderRadius:4, textTransform:"uppercase" }}>Overdue</span>}
      </div>
      {sub && <p style={{ fontSize:11, color:T.muted, marginBottom: progress !== undefined ? 8 : 0 }}>{sub}</p>}
      {progress !== undefined && (
        <div style={{ background: T.border, borderRadius:999, height:6, overflow:"hidden", marginTop:4 }}>
          <div style={{ height:6, borderRadius:999, background:T.indigo, width:`${Math.min(progress,100)}%`, transition:"width .6s" }} />
        </div>
      )}
      {sparkline && (
        <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:24, marginTop:4 }}>
          {[2,3,4,6].map((h,i) => (
            <div key={i} style={{ flex:1, borderRadius:3, height:`${h*4}px`,
              background: i===3 ? T.indigo : T.indigoFaint }} />
          ))}
        </div>
      )}
    </div>
  );
}

const AV = [
  {bg:"#c4e7ff",fg:"#004d6a"},{bg:"#dae2fd",fg:"#131b2e"},
  {bg:"#dcfce7",fg:"#15803d"},{bg:"#fef9c3",fg:"#92400e"},
  {bg:"#ede9fe",fg:"#6d28d9"},{bg:"#ffedd5",fg:"#c2410c"},
];
function Avatar({ name }) {
  const initials = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const c = AV[name.charCodeAt(0) % AV.length];
  return <div style={{ width:30,height:30,borderRadius:"50%",background:c.bg,color:c.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,letterSpacing:".3px" }}>{initials}</div>;
}

const ST_STYLE = {
  Paid:    {label:"COMPLETED",bg:"#d1fae5",color:"#065f46"},
  Partial: {label:"PENDING",  bg:"#fef3c7",color:"#92400e"},
  Pending: {label:"OVERDUE",  bg:"#fee2e2",color:"#991b1b"},
};
function StatusBadge({ status }) {
  const s = ST_STYLE[status] || ST_STYLE.Pending;
  return <span style={{ padding:"2px 9px",borderRadius:999,fontSize:10,fontWeight:700,textTransform:"uppercase",background:s.bg,color:s.color }}>{s.label}</span>;
}

function IconBox({ T, children }) {
  return (
    <div style={{ padding:6, background:T.indigoFaint, borderRadius:6, border:`1px solid ${T.border}`, display:"flex" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth="2" style={{width:15,height:15}}>{children}</svg>
    </div>
  );
}

export default function Dashboard() {
  const { dark } = useTheme();
  const T = tok(dark);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { setStudents(getStudents()); }, []);

  const totalStudents    = students.length;
  const pendingCount     = students.filter(s=>s.status==="Pending").length;
  const partialCount     = students.filter(s=>s.status==="Partial").length;
  const totalCollected   = students.reduce((s,st)=>s+st.paidAmount,0);
  const totalOutstanding = students.reduce((s,st)=>s+st.balance,0);
  const totalFees        = totalCollected + totalOutstanding;
  const collectionRate   = totalFees>0 ? Math.round((totalCollected/totalFees)*100) : 0;
  const recentPayments   = students.flatMap(s=>s.payments.map(p=>({...p,student:s}))).sort((a,b)=>b.id.localeCompare(a.id)).slice(0,5);
  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26,fontWeight:800,color:T.text,margin:0,letterSpacing:"-.02em" }}>{greeting}, Administrator</h1>
        <p style={{ fontSize:14,color:T.muted,marginTop:4 }}>Here is a summary of the college's financial status for the current billing cycle.</p>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28 }}>
        <KpiCard T={T} label="Total Enrolled Students" value={totalStudents.toLocaleString("en-IN")} trend="2.4%" trendUp sparkline
          icon={<IconBox T={T}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconBox>} />
        <KpiCard T={T} label="Pending Invoices" value={pendingCount} trend="5%" trendUp={false}
          sub={`${partialCount} partial payments recorded`} progress={Math.round((pendingCount/Math.max(totalStudents,1))*100)}
          icon={<IconBox T={T}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></IconBox>} />
        <KpiCard T={T} label="Total Revenue (MTD)" value={fmt(totalCollected)} trend="12%" trendUp sparkline
          icon={<IconBox T={T}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></IconBox>} />
        <KpiCard T={T} label="Outstanding Balance" value={fmt(totalOutstanding)} dangerCard
          sub={`${pendingCount+partialCount} accounts with dues`}
          icon={<svg viewBox="0 0 20 20" fill={T.danger} style={{width:18,height:18}}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 280px",gap:20,alignItems:"start" }}>
        {/* Latest Payments */}
        <div style={{ background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.shadow,overflow:"hidden" }}>
          <div style={{ padding:"18px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <h4 style={{ fontSize:16,fontWeight:700,color:T.indigo,margin:0 }}>Latest Payments</h4>
            <button onClick={()=>navigate("/students")} style={{ background:"none",border:"none",color:T.success,fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>View All Transactions</button>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ background:T.surfaceLow }}>
                {["STUDENT NAME","AMOUNT","DATE","STATUS"].map((h,i)=>(
                  <th key={h} style={{ padding:"10px 24px",textAlign:i===1?"right":"left",fontSize:9,fontWeight:700,color:T.kpiLabel,textTransform:"uppercase",letterSpacing:".1em",borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPayments.length===0
                ? <tr><td colSpan={4} style={{ textAlign:"center",padding:40,color:T.muted,fontSize:13 }}>No payments yet</td></tr>
                : recentPayments.map((p,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${T.border}`,cursor:"pointer",transition:"background .12s" }}
                    onMouseEnter={e=>e.currentTarget.style.background=T.tableHover}
                    onMouseLeave={e=>e.currentTarget.style.background=""}
                    onClick={()=>navigate(`/students/${p.student.id}`)}>
                    <td style={{ padding:"13px 24px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <Avatar name={p.student.name}/>
                        <div>
                          <div style={{ fontWeight:600,color:T.text,fontSize:13.5 }}>{p.student.name}</div>
                          <div style={{ fontSize:11.5,color:T.muted }}>{p.student.class} · {p.student.stream}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"13px 24px",fontWeight:700,color:T.text,textAlign:"right",...NUM }}>{fmt(p.amount)}</td>
                    <td style={{ padding:"13px 24px",color:T.muted,fontSize:12.5,...NUM }}>{p.date}</td>
                    <td style={{ padding:"13px 24px" }}><StatusBadge status={p.student.status}/></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Right panel */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:20 }}>
            <h4 style={{ fontSize:14,fontWeight:700,color:T.indigo,margin:"0 0 14px" }}>Common Tasks</h4>
            {[
              {label:"Register New Student",to:"/students",iconBg:T.indigoFaint,stroke:T.indigo,icon:<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>},
              {label:"Run Weekly Report",  to:"/reports",iconBg:`${T.success}18`,stroke:T.success,icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>},
            ].map(item=>(
              <button key={item.label} onClick={()=>navigate(item.to)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                border:`1px solid ${T.border}`,borderRadius:10,background:T.surface,cursor:"pointer",
                fontFamily:"inherit",fontSize:13,fontWeight:600,color:T.text,textAlign:"left",
                width:"100%",marginBottom:8,transition:"background .12s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=T.indigoFaint}
                onMouseLeave={e=>e.currentTarget.style.background=T.surface}>
                <div style={{ width:30,height:30,borderRadius:7,background:item.iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={item.stroke} strokeWidth="2" style={{width:15,height:15}}>{item.icon}</svg>
                </div>
                {item.label}
              </button>
            ))}
          </div>

          {/* Financial Health */}
          <div style={{ background: dark?"#1a1d2e":"#0f172a", borderRadius:16,padding:20,color:"#fff",border:`1px solid ${dark?"#2a2f50":"#1e293b"}` }}>
            <h4 style={{ fontSize:14,fontWeight:700,margin:"0 0 10px" }}>Financial Health</h4>
            <p style={{ fontSize:12.5,color:"rgba(255,255,255,.6)",lineHeight:1.6,marginBottom:14 }}>
              The college is at <span style={{ color:"#fff",fontWeight:700,...NUM }}>{collectionRate}%</span> collection efficiency for the Fall Semester.
            </p>
            <div style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6 }}>
                <span>Current: <span style={NUM}>{collectionRate}%</span></span>
                <span>Target: <span style={NUM}>96%</span></span>
              </div>
              <div style={{ background:"rgba(255,255,255,.12)",borderRadius:999,height:6 }}>
                <div style={{ height:6,borderRadius:999,width:`${Math.min(collectionRate,100)}%`,
                  background:collectionRate>=90?"#22c55e":collectionRate>=70?"#f59e0b":"#ef4444",transition:"width .6s" }} />
              </div>
            </div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,.3)" }}>Target: <span style={NUM}>96%</span> by Dec 1st</div>
          </div>
        </div>
      </div>
    </div>
  );
}
