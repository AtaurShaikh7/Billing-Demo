import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, addStudent, FEE_STRUCTURE, STREAMS, CLASSES } from "../data/students";
import { useTheme } from "../App";
import { tok } from "../theme";

const NUM = { fontFamily: "'Roboto', sans-serif" };
function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

const AV = [
  {bg:"#c4e7ff",fg:"#004d6a"},{bg:"#dae2fd",fg:"#131b2e"},
  {bg:"#dcfce7",fg:"#15803d"},{bg:"#fef9c3",fg:"#92400e"},
  {bg:"#ede9fe",fg:"#6d28d9"},{bg:"#ffedd5",fg:"#c2410c"},
];
function Avatar({ name }) {
  const initials = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const c = AV[name.charCodeAt(0) % AV.length];
  return <div style={{ width:32,height:32,borderRadius:"50%",background:c.bg,color:c.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0 }}>{initials}</div>;
}

const STATUS_MAP = {
  Paid:    {label:"Active",   bg:"#dcfce7",color:"#15803d"},
  Partial: {label:"On Leave", bg:"#ffedd5",color:"#c2410c"},
  Pending: {label:"Overdue",  bg:"#fee2e2",color:"#b91c1c"},
};
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.Pending;
  return <span style={{ padding:"2px 10px",borderRadius:999,fontSize:11,fontWeight:700,textTransform:"uppercase",background:s.bg,color:s.color }}>{s.label}</span>;
}

function KpiCard({ icon, label, value, badge, badgeColor, progress, sparkline, T }) {
  return (
    <div style={{ background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,padding:24,boxShadow:T.shadow }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
        <span style={{ fontSize:10,fontWeight:700,color:T.kpiLabel,textTransform:"uppercase",letterSpacing:".1em" }}>{label}</span>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          <div style={{ width:30,height:30,borderRadius:6,background:T.indigoFaint,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth="2" style={{width:15,height:15}}>{icon}</svg>
          </div>
          <span style={{ fontSize:11,fontWeight:700,color:badgeColor||T.muted }}>{badge}</span>
        </div>
      </div>
      <h3 style={{ fontSize:24,fontWeight:700,color:T.kpiValue,margin:"0 0 8px",...NUM }}>{value}</h3>
      {progress!==undefined && (
        <div style={{ background:T.border,borderRadius:999,height:6,overflow:"hidden",marginTop:4 }}>
          <div style={{ height:6,borderRadius:999,background:T.indigo,width:`${Math.min(progress,100)}%` }}/>
        </div>
      )}
      {sparkline && (
        <div style={{ display:"flex",alignItems:"flex-end",gap:4,height:22,marginTop:4 }}>
          {[2,3,4,6].map((h,i)=>(
            <div key={i} style={{ flex:1,borderRadius:3,height:`${h*3.5}px`,background:i===3?T.indigo:T.indigoFaint }}/>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, T }) {
  const [hov,setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:6,border:"none",borderRadius:6,cursor:"pointer",background:hov?T.indigoFaint:"transparent",color:hov?T.indigo:T.muted,display:"flex",alignItems:"center",transition:"all .15s" }}>
      {children}
    </button>
  );
}

/* ══ ADD STUDENT MODAL ══ */
const EMPTY = { name:"",email:"",phone:"",dob:"",address:"",class:"",stream:"",academicYear:"2025–26" };

function AddStudentModal({ onClose, onAdded, T }) {
  const [form,setForm] = useState(EMPTY);
  const [errors,setErrors] = useState({});
  const [success,setSuccess] = useState(false);
  const overlayRef = useRef();

  function set(k,v) { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:""})); }
  const fees = form.stream ? FEE_STRUCTURE[form.stream] : null;
  const total = fees ? fees.tuition+fees.exam+fees.lab+fees.misc : 0;

  function validate() {
    const e={};
    if(!form.name.trim()) e.name="Required";
    if(!form.phone.trim()||!/^\d{10}$/.test(form.phone)) e.phone="Valid 10-digit number";
    if(!form.email.trim()||!form.email.includes("@")) e.email="Valid email required";
    if(!form.dob) e.dob="Required";
    if(!form.class) e.class="Select a class";
    if(!form.stream) e.stream="Select a stream";
    if(!form.address.trim()) e.address="Required";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs=validate();
    if(Object.keys(errs).length){setErrors(errs);return;}
    addStudent(form);setSuccess(true);
    setTimeout(()=>{onAdded();onClose();},1400);
  }

  const inputStyle=(focused,err)=>({
    width:"100%",padding:"9px 12px",boxSizing:"border-box",fontFamily:"inherit",
    fontSize:13.5,color:T.text,outline:"none",
    background:T.inputBg,
    border:`${focused?2:1}px solid ${err?T.danger:focused?T.indigo:T.inputBd}`,
    borderRadius:8,boxShadow:focused&&!err?`0 0 0 3px ${T.indigoFaint}`:"none",transition:"border .15s,box-shadow .15s",
  });

  function SField({label,id,err,children}){
    return (
      <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
        <label htmlFor={id} style={{ fontSize:12.5,fontWeight:600,color:T.text }}>{label}</label>
        {children}
        {err&&<span style={{ fontSize:11.5,color:T.danger }}>{err}</span>}
      </div>
    );
  }
  function TInput({id,type="text",placeholder,value,onChange,err,...rest}){
    const [f,setF]=useState(false);
    return <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={inputStyle(f,err)} {...rest}/>;
  }
  function TSelect({id,value,onChange,err,children}){
    const [f,setF]=useState(false);
    return <select id={id} value={value} onChange={onChange}
      onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{...inputStyle(f,err),cursor:"pointer"}}>{children}</select>;
  }

  return (
    <div ref={overlayRef} onClick={e=>e.target===overlayRef.current&&onClose()}
      style={{ position:"fixed",inset:0,background:"rgba(11,28,48,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20 }}>
      <div style={{ background:T.surface,borderRadius:16,width:"100%",maxWidth:620,boxShadow:T.shadowMd,display:"flex",flexDirection:"column",maxHeight:"90vh",overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"20px 28px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:9,background:T.indigoFaint,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.indigo} strokeWidth="2" style={{width:19,height:19}}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize:17,fontWeight:700,color:T.text,margin:0 }}>Register New Student</h3>
              <p style={{ fontSize:12.5,color:T.muted,margin:0,marginTop:2 }}>Fill in the details to enrol a student</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted,width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY:"auto",padding:"24px 28px",flex:1 }}>
          {success ? (
            <div style={{ textAlign:"center",padding:"32px 0" }}>
              <div style={{ width:60,height:60,borderRadius:"50%",background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" style={{width:30,height:30}}><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize:17,fontWeight:700,color:T.text,marginBottom:6 }}>Student Enrolled!</div>
              <div style={{ fontSize:13.5,color:T.muted }}>{form.name} added to {form.class} — {form.stream}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="add-student-form">
              <p style={{ fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:14 }}>Personal Details</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>
                <SField label="Full Name *" err={errors.name}>
                  <TInput id="n1" placeholder="e.g. Aryan Sharma" value={form.name} onChange={e=>set("name",e.target.value)} err={errors.name} autoFocus/>
                </SField>
                <SField label="Date of Birth *" err={errors.dob}>
                  <TInput id="n2" type="date" value={form.dob} onChange={e=>set("dob",e.target.value)} err={errors.dob}/>
                </SField>
                <SField label="Mobile Number *" err={errors.phone}>
                  <TInput id="n3" placeholder="10-digit number" value={form.phone} onChange={e=>set("phone",e.target.value)} err={errors.phone} maxLength={10}/>
                </SField>
                <SField label="Email Address *" err={errors.email}>
                  <TInput id="n4" type="email" placeholder="student@example.com" value={form.email} onChange={e=>set("email",e.target.value)} err={errors.email}/>
                </SField>
                <div style={{ gridColumn:"span 2" }}>
                  <SField label="Residential Address *" err={errors.address}>
                    <textarea rows={2} placeholder="House/Flat no., Area, Mumbra, Thane"
                      value={form.address} onChange={e=>set("address",e.target.value)}
                      style={{ ...inputStyle(false,errors.address),resize:"vertical",fontFamily:"inherit" }}/>
                  </SField>
                </div>
              </div>

              <p style={{ fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:14 }}>Academic Details</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:20 }}>
                <SField label="Class *" err={errors.class}>
                  <TSelect id="n5" value={form.class} onChange={e=>set("class",e.target.value)} err={errors.class}>
                    <option value="">Select</option>{CLASSES.map(c=><option key={c}>{c}</option>)}
                  </TSelect>
                </SField>
                <SField label="Stream *" err={errors.stream}>
                  <TSelect id="n6" value={form.stream} onChange={e=>set("stream",e.target.value)} err={errors.stream}>
                    <option value="">Select</option>{STREAMS.map(s=><option key={s}>{s}</option>)}
                  </TSelect>
                </SField>
                <SField label="Academic Year">
                  <input value={form.academicYear} readOnly style={{ ...inputStyle(false,false),background:T.surfaceLow,cursor:"not-allowed" }}/>
                </SField>
              </div>

              {fees && (
                <div style={{ background:T.surfaceLow,borderRadius:10,padding:"16px 18px",border:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:12 }}>Fee Structure — {form.stream}</p>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 32px",fontSize:13 }}>
                    {[["Tuition Fee",fees.tuition],["Examination Fee",fees.exam],...(fees.lab>0?[["Lab / Practical Fee",fees.lab]]:[]),["Library & Misc.",fees.misc]]
                      .map(([lbl,val])=>(
                        <div key={lbl} style={{ display:"flex",justifyContent:"space-between",paddingBottom:4,borderBottom:`1px solid ${T.border}` }}>
                          <span style={{ color:T.muted }}>{lbl}</span>
                          <span style={{ fontWeight:600,color:T.text,...NUM }}>{fmt(val)}</span>
                        </div>
                    ))}
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,fontWeight:800,fontSize:14,color:T.text,paddingTop:8,borderTop:`2px solid ${T.border}` }}>
                    <span>Total Annual Fee</span>
                    <span style={{ color:T.indigo,...NUM }}>{fmt(total)}</span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div style={{ padding:"16px 28px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0 }}>
            <button type="button" onClick={onClose} style={{ padding:"9px 20px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" form="add-student-form" style={{ padding:"9px 24px",borderRadius:8,border:"none",background:T.indigo,color:"#fff",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:15,height:15}}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Register Student
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══ STUDENTS PAGE ══ */
const DEPT_OPT   = ["All Departments","Science","Commerce","Arts"];
const STATUS_OPT = ["All Status","Active","On Leave","Overdue"];
const S_REV      = {"Active":"Paid","On Leave":"Partial","Overdue":"Pending"};

export default function Students() {
  const { dark } = useTheme();
  const T = tok(dark);
  const [students,setStudents]   = useState([]);
  const [search,setSearch]       = useState("");
  const [dept,setDept]           = useState("All Departments");
  const [status,setStatus]       = useState("All Status");
  const [page,setPage]           = useState(1);
  const [hovRow,setHovRow]       = useState(null);
  const [showModal,setShowModal] = useState(false);
  const navigate = useNavigate();
  const PER = 8;

  function load() { setStudents(getStudents()); }
  useEffect(load,[]);

  const filtered = students.filter(s=>{
    const q=search.toLowerCase();
    const mQ=!q||s.name.toLowerCase().includes(q)||s.id.toLowerCase().includes(q)||s.rollNo.toLowerCase().includes(q);
    const mD=dept==="All Departments"||s.stream===dept;
    const mS=status==="All Status"||s.status===S_REV[status];
    return mQ&&mD&&mS;
  });
  const totalPages = Math.max(1,Math.ceil(filtered.length/PER));
  const paginated  = filtered.slice((page-1)*PER,page*PER);

  const total   = students.length;
  const newRegs = students.filter(s=>s.enrolledOn?.includes("2025")).length;
  const syCount = students.filter(s=>s.class==="SY (12th)").length;
  const paidPct = total>0?((students.filter(s=>s.status==="Paid").length/total)*100).toFixed(1):"0.0";

  const selStyle = { padding:"7px 12px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,color:T.text,background:T.surface,outline:"none",fontFamily:"inherit",cursor:"pointer" };

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      {showModal && <AddStudentModal T={T} onClose={()=>setShowModal(false)} onAdded={()=>{load();setShowModal(false);}}/>}

      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32 }}>
        <div>
          <h2 style={{ fontSize:32,fontWeight:800,color:T.indigo,margin:0,letterSpacing:"-.02em",lineHeight:1.2 }}>Students Directory</h2>
          <p style={{ fontSize:16,color:T.muted,marginTop:4 }}>Manage and monitor academic records across departments.</p>
        </div>
        <button onClick={()=>setShowModal(true)} style={{ display:"flex",alignItems:"center",gap:8,background:T.text,color:dark?"#0d0f1a":"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:18,height:18}}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          Register New Student
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:32 }}>
        <KpiCard T={T} icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} label="Total Students" value={total.toLocaleString("en-IN")} badge="+4.2%" badgeColor={T.success} sparkline/>
        <KpiCard T={T} icon={<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>} label="New Registrations" value={newRegs} badge="Active" badgeColor={T.success} progress={Math.round((newRegs/Math.max(total,1))*100)}/>
        <KpiCard T={T} icon={<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>} label="Graduation Track" value={syCount} badge="Semester" progress={Math.round((syCount/Math.max(total,1))*100)}/>
        <KpiCard T={T} icon={<><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="2"/></>} label="Active Enrollment" value={`${paidPct}%`} badge="Stable" sparkline/>
      </div>

      {/* Table */}
      <div style={{ background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,boxShadow:T.shadow,overflow:"hidden" }}>
        {/* Filter bar */}
        <div style={{ padding:"14px 24px",background:T.surfaceCnt,borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
            <div style={{ position:"relative" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2" style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:14,height:14 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search students..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{ ...selStyle,paddingLeft:30,width:200 }}/>
            </div>
            <select value={dept} onChange={e=>{setDept(e.target.value);setPage(1);}} style={selStyle}>
              {DEPT_OPT.map(o=><option key={o}>{o}</option>)}
            </select>
            <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} style={selStyle}>
              {STATUS_OPT.map(o=><option key={o}>{o}</option>)}
            </select>
            {(search||dept!=="All Departments"||status!=="All Status")&&(
              <button onClick={()=>{setSearch("");setDept("All Departments");setStatus("All Status");setPage(1);}} style={{ fontSize:12.5,color:T.indigo,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600 }}>Clear</button>
            )}
          </div>
          <button style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,color:T.muted,fontFamily:"inherit" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            More Filters
          </button>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:14 }}>
            <thead>
              <tr style={{ background:T.surfaceLow }}>
                {["Student Name","Student ID","Department","Enrollment Date","Status","Actions"].map((h,i)=>(
                  <th key={h} style={{ padding:"14px 24px",textAlign:i===5?"right":"left",fontSize:12,fontWeight:700,color:T.kpiLabel,textTransform:"uppercase",letterSpacing:".05em",borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length===0
                ? <tr><td colSpan={6} style={{ textAlign:"center",padding:"48px 24px",color:T.muted }}>No students match your filters.</td></tr>
                : paginated.map((s,idx)=>(
                  <tr key={s.id} onMouseEnter={()=>setHovRow(idx)} onMouseLeave={()=>setHovRow(null)}
                    style={{ borderBottom:`1px solid ${T.border}`,background:hovRow===idx?T.tableHover:T.surface,transition:"background .12s",cursor:"pointer" }}
                    onClick={()=>navigate(`/students/${s.id}`)}>
                    <td style={{ padding:"14px 24px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        <Avatar name={s.name}/>
                        <span style={{ fontSize:14,fontWeight:600,color:T.text }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"14px 24px",color:T.muted,fontSize:13,...NUM }}>{s.id}</td>
                    <td style={{ padding:"14px 24px",color:T.muted,fontSize:14 }}>{s.stream} · {s.class}</td>
                    <td style={{ padding:"14px 24px",color:T.muted,fontSize:14,...NUM }}>{s.enrolledOn||"Jun 2025"}</td>
                    <td style={{ padding:"14px 24px" }}><StatusBadge status={s.status}/></td>
                    <td style={{ padding:"14px 24px",textAlign:"right" }} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,opacity:hovRow===idx?1:0,transition:"opacity .15s" }}>
                        <IconBtn T={T} onClick={()=>navigate(`/students/${s.id}`)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </IconBtn>
                        <IconBtn T={T} onClick={()=>navigate(`/students/${s.id}`)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding:"14px 24px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13,color:T.muted }}>
          <span style={NUM}>Showing {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} of <strong style={{ color:T.text }}>{filtered.length}</strong> students</span>
          <div style={{ display:"flex",gap:6 }}>
            {[["←",page>1,()=>setPage(p=>p-1)],["→",page<totalPages,()=>setPage(p=>p+1)]].map(([lbl,en,fn])=>(
              <button key={lbl} onClick={en?fn:undefined} disabled={!en}
                style={{ width:30,height:30,border:`1px solid ${T.border}`,borderRadius:6,background:T.surface,cursor:en?"pointer":"not-allowed",color:en?T.text:T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700 }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
