import { useState, useEffect } from "react";
import { getStudents } from "../data/students";
import { useTheme } from "../App";
import { tok } from "../theme";

const NUM = { fontFamily: "'Roboto', sans-serif" };
function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

function KpiCard({ label, value, trend, trendUp, sub, progress, sparkline, dangerCard, children, T }) {
  return (
    <div style={{
      background:T.surface, borderRadius:16, padding:24, boxShadow:T.shadow,
      border: dangerCard ? `1px solid ${T.danger}50` : `1px solid ${T.border}`,
      borderLeft: dangerCard ? `4px solid ${T.danger}` : undefined,
    }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
        <span style={{ fontSize:10,fontWeight:700,color:T.kpiLabel,textTransform:"uppercase",letterSpacing:".1em" }}>{label}</span>
        {children}
      </div>
      <div style={{ display:"flex",alignItems:"baseline",gap:8,marginBottom:(sub||progress!==undefined||sparkline)?12:0 }}>
        <h3 style={{ fontSize:24,fontWeight:700,color:T.kpiValue,margin:0,...NUM }}>{value}</h3>
        {trend && <span style={{ fontSize:12,fontWeight:600,color:trendUp?T.success:T.danger,display:"flex",alignItems:"center",gap:2 }}>{trendUp?"▲":"▼"}<span style={NUM}>{trend}</span></span>}
        {dangerCard && <span style={{ fontSize:9,fontWeight:700,background:`${T.danger}20`,color:T.danger,padding:"2px 6px",borderRadius:4,textTransform:"uppercase" }}>Overdue</span>}
      </div>
      {sub && <p style={{ fontSize:11,color:T.muted,marginBottom:progress!==undefined?10:0 }}>{sub}</p>}
      {progress!==undefined && (
        <div style={{ background:T.border,borderRadius:999,height:6,overflow:"hidden",marginTop:4 }}>
          <div style={{ height:6,borderRadius:999,background:T.indigo,width:`${Math.min(progress,100)}%`,transition:"width .6s" }} />
        </div>
      )}
      {sparkline && (
        <div style={{ display:"flex",alignItems:"flex-end",gap:4,height:24,marginTop:4 }}>
          {[2,3,4,6].map((h,i)=>(
            <div key={i} style={{ flex:1,borderRadius:3,height:`${h*4}px`, background:i===3?T.indigo:T.indigoFaint }} />
          ))}
        </div>
      )}
    </div>
  );
}

function RevenueChart({ currentFY, lastFY, T }) {
  const months=["Jul","Aug","Sep","Oct","Nov","Dec"];
  const W=500,H=200,PL=30,PT=10,PB=30,PR=10;
  const cw=W-PL-PR,ch=H-PT-PB;
  const maxV=Math.max(...currentFY,...lastFY)*1.1;
  const toX=i=>PL+(i/(months.length-1))*cw;
  const toY=v=>PT+ch-(v/maxV)*ch;
  function pathD(pts){
    return pts.map((v,i)=>{
      const x=toX(i),y=toY(v);
      if(i===0) return `M${x},${y}`;
      const px=toX(i-1),py=toY(pts[i-1]);
      return `C${px+(x-px)/2},${py} ${px+(x-px)/2},${y} ${x},${y}`;
    }).join(" ");
  }
  const yLabels=[0,Math.round(maxV/2/100000)*100000,Math.round(maxV/100000)*100000];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%",height:"100%" }} overflow="visible">
      {yLabels.map((v,i)=>{
        const y=toY(v);
        return <g key={i}>
          <line x1={PL} y1={y} x2={W-PR} y2={y} stroke={T.border} strokeWidth="1"/>
          <text x={PL-6} y={y+4} fontSize="9" fill={T.muted} textAnchor="end" style={NUM}>
            {v>=1000000?`${(v/1000000).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:v}
          </text>
        </g>;
      })}
      <path d={pathD(lastFY)} fill="none" stroke={T.border} strokeWidth="2" strokeDasharray="5,4"/>
      <path d={pathD(currentFY)} fill="none" stroke={T.indigo} strokeWidth="2.5"/>
      {currentFY.map((v,i)=>(
        <circle key={i} cx={toX(i)} cy={toY(v)} r="4" fill={T.surface} stroke={T.indigo} strokeWidth="2.5"/>
      ))}
      {months.map((m,i)=>(
        <text key={m} x={toX(i)} y={H-6} fontSize="9" fill={T.muted} textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

function DonutChart({ slices, total, T }) {
  const R=15.915,C=18; let offset=0;
  return (
    <svg viewBox="0 0 36 36" style={{ width:"100%",height:"100%",transform:"rotate(-90deg)" }}>
      <circle cx={C} cy={C} r={R} fill="none" stroke={T.border} strokeWidth="4"/>
      {slices.map((s,i)=>{
        const el=<circle key={i} cx={C} cy={C} r={R} fill="none" stroke={s.color} strokeWidth="4" strokeDasharray={`${s.pct} ${100-s.pct}`} strokeDashoffset={-offset}/>;
        offset+=s.pct; return el;
      })}
    </svg>
  );
}

const TYPE_STYLE = {
  Audit:      (T)=>({ bg:T.indigoFaint, color:T.indigo }),
  Revenue:    ()=>({ bg:"rgba(124,58,237,.12)", color:"#7c3aed" }),
  Compliance: ()=>({ bg:"rgba(13,148,136,.12)", color:"#0d9488" }),
};
function TypeBadge({ type, T }) {
  const s=(TYPE_STYLE[type]||TYPE_STYLE.Audit)(T);
  return <span style={{ padding:"2px 8px",borderRadius:4,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",background:s.bg,color:s.color }}>{type}</span>;
}

export default function Reports() {
  const { dark } = useTheme();
  const T = tok(dark);
  const [students,setStudents]=useState([]);
  const [reportFilter,setReportFilter]=useState("All Report Types");
  const [dateFrom,setDateFrom]=useState("2025-06-01");
  const [dateTo,setDateTo]=useState("2025-06-30");
  const [showDatePicker,setShowDatePicker]=useState(false);
  const [pendingFrom,setPendingFrom]=useState(dateFrom);
  const [pendingTo,setPendingTo]=useState(dateTo);

  useEffect(()=>{setStudents(getStudents());},[]);

  function applyDates(){setDateFrom(pendingFrom);setDateTo(pendingTo);setShowDatePicker(false);}
  function fmtLabel(d){return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});}

  const totalRevenue=students.reduce((s,st)=>s+st.paidAmount,0);
  const totalOutstanding=students.reduce((s,st)=>s+st.balance,0);
  const totalFees=totalRevenue+totalOutstanding;
  const collectionRate=totalFees>0?((totalRevenue/totalFees)*100).toFixed(1):"0.0";
  const overdueCount=students.filter(s=>s.status==="Pending").length;
  const outstandingCount=students.filter(s=>s.status!=="Paid").length;
  const currentFY=[180000,320000,410000,totalRevenue,520000,580000];
  const lastFY=[150000,270000,360000,390000,460000,510000];
  const streamTotals={Science:0,Commerce:0,Arts:0};
  students.forEach(s=>{streamTotals[s.stream]=(streamTotals[s.stream]||0)+s.paidAmount;});
  const gt=Object.values(streamTotals).reduce((a,b)=>a+b,0);
  const donutSlices=[
    {label:"Science", color:T.indigo,  pct:gt?Math.round(streamTotals.Science/gt*100):35},
    {label:"Commerce",color:"#7c3aed", pct:gt?Math.round(streamTotals.Commerce/gt*100):25},
    {label:"Arts",    color:"#0d9488", pct:gt?Math.round(streamTotals.Arts/gt*100):20},
  ];

  const REPORTS=[
    {name:"Q3 Fee Collection Audit",           type:"Audit",      date:"24 Jun 2025",status:"Ready"},
    {name:"FY Junior College Tuition Summary",  type:"Revenue",    date:"22 Jun 2025",status:"Ready"},
    {name:"Financial Aid & Concession Matching",type:"Compliance", date:"19 Jun 2025",status:"Processing"},
    {name:"SY Science Stream Fee Report",       type:"Audit",      date:"15 Jun 2025",status:"Ready"},
    {name:"Annual Outstanding Balance Report",  type:"Revenue",    date:"10 Jun 2025",status:"Ready"},
  ];
  const filteredReports=REPORTS.filter(r=>reportFilter==="All Report Types"||r.type===reportFilter);

  const iconBox=(paths)=>(
    <div style={{ padding:6,background:T.indigoFaint,borderRadius:6,border:`1px solid ${T.border}`,display:"flex" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth="2" style={{width:15,height:15}}>{paths}</svg>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32 }}>
        <div>
          <h2 style={{ fontSize:26,fontWeight:700,color:T.indigo,margin:0,letterSpacing:"-.02em" }}>Reports &amp; Analytics</h2>
          <p style={{ fontSize:14,color:T.muted,marginTop:4 }}>Institutional financial performance oversight and data extraction.</p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {/* Date picker */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>{setPendingFrom(dateFrom);setPendingTo(dateTo);setShowDatePicker(v=>!v);}} style={{
              background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,
              padding:"8px 14px",display:"flex",alignItems:"center",gap:8,
              fontSize:13,fontWeight:500,color:T.text,cursor:"pointer",fontFamily:"inherit",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{width:15,height:15}}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={NUM}>{fmtLabel(dateFrom)} – {fmtLabel(dateTo)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{width:13,height:13}}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDatePicker && (
              <div style={{
                position:"absolute",top:"calc(100% + 8px)",right:0,zIndex:50,
                background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,
                padding:20,boxShadow:T.shadowMd,minWidth:280,
              }}>
                <p style={{ fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".08em",marginBottom:14 }}>Date Range</p>
                {[["From",pendingFrom,setPendingFrom],["To",pendingTo,setPendingTo]].map(([lbl,val,set])=>(
                  <div key={lbl} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:T.text,display:"block",marginBottom:4 }}>{lbl}</label>
                    <input type="date" value={val} onChange={e=>set(e.target.value)} style={{
                      width:"100%",padding:"8px 10px",border:`1px solid ${T.border}`,borderRadius:7,
                      fontSize:13,fontFamily:"inherit",outline:"none",color:T.text,
                      background:T.inputBg,boxSizing:"border-box",
                    }} onFocus={e=>e.target.style.borderColor=T.indigo} onBlur={e=>e.target.style.borderColor=T.border}/>
                  </div>
                ))}
                <div style={{ display:"flex",gap:8,marginTop:16 }}>
                  <button onClick={()=>setShowDatePicker(false)} style={{ flex:1,padding:"8px",border:`1px solid ${T.border}`,borderRadius:7,background:T.surface,fontSize:13,cursor:"pointer",fontFamily:"inherit",color:T.text }}>Cancel</button>
                  <button onClick={applyDates} style={{ flex:1,padding:"8px",border:"none",borderRadius:7,background:T.indigo,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Apply</button>
                </div>
              </div>
            )}
          </div>
          <button style={{ background:T.text,color:dark?"#0d0f1a":"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:7 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Data
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28 }}>
        <KpiCard T={T} label="Total Revenue" value={fmt(totalRevenue)} trend="12.4%" trendUp sparkline>
          {iconBox(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>)}
        </KpiCard>
        <KpiCard T={T} label="Collection Rate" value={`${collectionRate}%`} sub={`Target: 92%`} progress={parseFloat(collectionRate)}>
          <span style={{ color:T.indigo,fontWeight:700,fontSize:18,...NUM }}>%</span>
        </KpiCard>
        <KpiCard T={T} label="Outstanding Fees" value={fmt(totalOutstanding)} sub={`${overdueCount} accounts require immediate audit attention.`} dangerCard>
          <svg viewBox="0 0 20 20" fill={T.danger} style={{width:18,height:18}}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
        </KpiCard>
        <KpiCard T={T} label="No. of Outstanding Students" value={outstandingCount.toLocaleString("en-IN")} trend="8.2%" trendUp={false} progress={Math.round((outstandingCount/Math.max(students.length,1))*100)}>
          {iconBox(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>)}
        </KpiCard>
      </div>

      {/* Charts */}
      <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:20,marginBottom:28 }}>
        <div style={{ background:T.surface,borderRadius:16,padding:28,border:`1px solid ${T.border}`,boxShadow:T.shadow }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
            <h4 style={{ fontSize:16,fontWeight:700,color:T.indigo,margin:0 }}>Revenue Trends</h4>
            <div style={{ display:"flex",alignItems:"center",gap:20 }}>
              {[{color:T.indigo,label:"Current FY"},{color:T.border,label:"Last FY"}].map(l=>(
                <div key={l.label} style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:l.color }}/>
                  <span style={{ fontSize:11,color:T.muted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ height:200,paddingLeft:28 }}><RevenueChart currentFY={currentFY} lastFY={lastFY} T={T}/></div>
        </div>
        <div style={{ background:T.surface,borderRadius:16,padding:28,border:`1px solid ${T.border}`,boxShadow:T.shadow }}>
          <h4 style={{ fontSize:16,fontWeight:700,color:T.indigo,margin:"0 0 24px" }}>Department Revenue</h4>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
            <div style={{ position:"relative",width:150,height:150,marginBottom:20 }}>
              <DonutChart slices={donutSlices} T={T}/>
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                <span style={{ fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em" }}>Total</span>
                <span style={{ fontSize:14,fontWeight:700,color:T.text,...NUM }}>{fmt(totalRevenue)}</span>
              </div>
            </div>
            <div style={{ width:"100%",display:"flex",flexDirection:"column",gap:12 }}>
              {donutSlices.map(s=>(
                <div key={s.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:10,height:10,borderRadius:"50%",background:s.color,flexShrink:0 }}/>
                    <span style={{ fontSize:12,fontWeight:600,color:T.muted }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize:12,fontWeight:700,color:T.text,...NUM }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div style={{ background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.shadow,overflow:"hidden" }}>
        <div style={{ padding:"18px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <h4 style={{ fontSize:16,fontWeight:700,color:T.indigo,margin:0 }}>Available Reports</h4>
          <select value={reportFilter} onChange={e=>setReportFilter(e.target.value)} style={{
            fontSize:12,border:`1px solid ${T.border}`,borderRadius:8,background:T.indigoFaint,
            padding:"6px 12px",color:T.text,fontWeight:500,outline:"none",cursor:"pointer",fontFamily:"inherit",
          }}>
            {["All Report Types","Audit","Revenue","Compliance"].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.surfaceLow,borderBottom:`1px solid ${T.border}` }}>
              {["Report Name","Type","Date Generated","Status","Actions"].map((h,i)=>(
                <th key={h} style={{ padding:"14px 24px",textAlign:i===4?"right":"left",fontSize:9,fontWeight:700,color:T.kpiLabel,textTransform:"uppercase",letterSpacing:".1em",whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((r,i)=>{
              const ready=r.status==="Ready";
              return <tr key={i} style={{ borderBottom:`1px solid ${T.border}`,transition:"background .12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=T.tableHover}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{ padding:"14px 24px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ padding:7,background:T.indigoFaint,color:T.indigo,borderRadius:6,display:"flex" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}>
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize:13.5,fontWeight:600,color:T.text }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ padding:"14px 24px" }}><TypeBadge type={r.type} T={T}/></td>
                <td style={{ padding:"14px 24px",fontSize:12,color:T.muted,fontWeight:500,...NUM }}>{r.date}</td>
                <td style={{ padding:"14px 24px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <div style={{ width:7,height:7,borderRadius:"50%",background:ready?T.success:T.warning,animation:ready?"none":"pulse 1.5s infinite" }}/>
                    <span style={{ fontSize:12,fontWeight:600,color:T.text }}>{r.status}</span>
                  </div>
                </td>
                <td style={{ padding:"14px 24px",textAlign:"right" }}>
                  <button disabled={!ready} style={{ background:"none",border:"none",cursor:ready?"pointer":"not-allowed",color:ready?T.muted:`${T.muted}40`,display:"inline-flex",padding:4,borderRadius:4,transition:"color .15s" }}
                    onMouseEnter={e=>ready&&(e.currentTarget.style.color=T.indigo)}
                    onMouseLeave={e=>(e.currentTarget.style.color=ready?T.muted:`${T.muted}40`)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
        <div style={{ padding:"12px 24px",background:T.indigoFaint,borderTop:`1px solid ${T.border}`,textAlign:"center" }}>
          <button style={{ fontSize:10,fontWeight:700,color:T.indigo,background:"none",border:"none",cursor:"pointer",textTransform:"uppercase",letterSpacing:".1em",fontFamily:"inherit" }}>View All Generated Reports</button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
