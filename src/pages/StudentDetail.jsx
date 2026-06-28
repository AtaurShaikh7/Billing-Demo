import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents, recordPayment } from "../data/students";

function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

function StatusBadge({ status }) {
  const cls = status === "Paid" ? "badge-paid" : status === "Partial" ? "badge-partial" : "badge-pending";
  return <span className={`badge-status ${cls}`}>{status}</span>;
}

const NUM = { fontFamily: "'Roboto', sans-serif" };

function PaymentModal({ student, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // "form" | "sms"
  const [smsResult, setSmsResult] = useState(null);
  const [pendingData, setPendingData] = useState(null);

  function handlePay() {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) { setError("Enter a valid amount"); return; }
    if (amt > student.balance) { setError(`Amount cannot exceed balance ${fmt(student.balance)}`); return; }

    const paymentId = `PAY${Date.now()}`;
    const payment = {
      id: paymentId,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      amount: amt,
      mode,
      receiptNo: `SMC-REC-${Date.now().toString().slice(-6)}`,
    };
    const updated = recordPayment(student.id, payment);
    setPendingData({ updated, paymentId, amt, payment });

    /* Simulate Twilio SMS dispatch */
    setStep("sms");
    setTimeout(() => {
      setSmsResult("sent");
    }, 1200);
  }

  function proceedToReceipt() {
    onSuccess(pendingData.updated, pendingData.paymentId);
  }

  /* SMS preview message */
  const smsText = pendingData
    ? `Dear ${student.name.split(" ")[0]}, your fee payment of ${fmt(pendingData.amt)} has been received by St. Mary's College, Mumbra. Receipt: ${pendingData?.payment?.receiptNo}. Thank you.`
    : "";

  if (step === "sms") {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <span className="modal-title">Payment Recorded</span>
            <button className="modal-close" onClick={proceedToReceipt}>&times;</button>
          </div>
          <div className="modal-body">
            {/* Payment confirmed */}
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"#dcfce7",borderRadius:8,marginBottom:18 }}>
              <div style={{ width:32,height:32,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{width:16,height:16}}><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <div style={{ fontWeight:700,color:"#15803d",fontSize:13.5 }}>Fee collected — {fmt(pendingData?.amt)}</div>
                <div style={{ fontSize:12,color:"#166534",marginTop:2,...NUM }}>{pendingData?.payment?.receiptNo} · {mode}</div>
              </div>
            </div>

            {/* SMS status */}
            <div style={{ background:"#f8fafc",border:"1px solid #e0e7ff",borderRadius:10,padding:16,marginBottom:4 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#3730a3" strokeWidth="2" style={{width:16,height:16}}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span style={{ fontSize:12.5,fontWeight:700,color:"#3730a3" }}>SMS Notification</span>
                {smsResult === "sent"
                  ? <span style={{ marginLeft:"auto",fontSize:11,fontWeight:700,background:"#dcfce7",color:"#15803d",padding:"2px 8px",borderRadius:20 }}>✓ Sent</span>
                  : <span style={{ marginLeft:"auto",fontSize:11,color:"#6b7280" }}>Sending…</span>
                }
              </div>
              {/* Phone */}
              <div style={{ fontSize:11.5,color:"#6b7280",marginBottom:10,...NUM }}>
                To: <strong style={{ color:"#0f172a" }}>+91 {student.phone}</strong>
              </div>
              {/* SMS bubble */}
              <div style={{ background:"#fff",border:"1px solid #e0e7ff",borderRadius:8,padding:"10px 14px",fontSize:12.5,color:"#374151",lineHeight:1.6,position:"relative" }}>
                <div style={{ position:"absolute",top:8,right:10,fontSize:10,color:"#9ca3af",...NUM }}>
                  {smsResult === "sent" ? "Delivered ✓✓" : "…"}
                </div>
                {smsText}
              </div>
              <p style={{ fontSize:11,color:"#9ca3af",marginTop:8 }}>
                SMS sent to student's registered mobile number
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={proceedToReceipt} style={{ gap:8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}>
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Record Payment</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>{student.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{student.rollNo} · {student.class} {student.stream}</div>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Fee</div><div style={{ fontWeight: 700, ...NUM }}>{fmt(student.totalFee)}</div></div>
              <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Paid</div><div style={{ fontWeight: 700, color: "var(--success)", ...NUM }}>{fmt(student.paidAmount)}</div></div>
              <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Balance</div><div style={{ fontWeight: 700, color: "var(--danger)", ...NUM }}>{fmt(student.balance)}</div></div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Payment Amount (₹) *</label>
            <input
              type="number"
              placeholder={`Max: ${student.balance}`}
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(""); }}
              min={1} max={student.balance} autoFocus
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Payment Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              {["Cash", "UPI", "NEFT", "Cheque", "DD"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* SMS notice */}
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#eff4ff",borderRadius:7,border:"1px solid #c7d7fd" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3730a3" strokeWidth="2" style={{width:14,height:14,flexShrink:0}}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize:11.5,color:"#3730a3" }}>
              An SMS confirmation will be sent to <strong style={{...NUM}}>+91 {student.phone}</strong> after payment is recorded.
            </span>
          </div>

          {error && <div className="error-msg" style={{ marginTop: 10 }}>{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePay}>Collect & Send SMS</button>
        </div>
      </div>
    </div>
  );
}

/* ── Send SMS button for payment history ── */
function SmsResendButton({ student, payment }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent

  function sendSms() {
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1200);
    setTimeout(() => setStatus("idle"), 4000);
  }

  const smsText = `Dear ${student.name.split(" ")[0]}, your fee payment of ₹${payment.amount.toLocaleString("en-IN")} on ${payment.date} (${payment.receiptNo}) has been recorded by St. Mary's College, Mumbra.`;

  if (status === "sent") {
    return (
      <span style={{
        display:"inline-flex", alignItems:"center", gap:5,
        fontSize:12, fontWeight:600, color:"#15803d",
        background:"#dcfce7", borderRadius:6, padding:"4px 10px",
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:12,height:12}}>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        SMS Sent
      </span>
    );
  }

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={sendSms}
      disabled={status === "sending"}
      title={smsText}
      style={{ display:"flex", alignItems:"center", gap:5, color:"#3730a3", borderColor:"#c7d7fd" }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {status === "sending" ? "Sending…" : "Send SMS"}
    </button>
  );
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("details");

  useEffect(() => {
    const s = getStudents().find(s => s.id === id);
    if (!s) navigate("/students");
    else setStudent(s);
  }, [id]);

  if (!student) return null;

  const pct = Math.round((student.paidAmount / student.totalFee) * 100);

  function handlePaySuccess(updatedStudents, paymentId) {
    const updated = updatedStudents.find(s => s.id === id);
    setStudent(updated);
    setShowModal(false);
    navigate(`/receipt/${id}/${paymentId}`);
  }

  return (
    <>
      {showModal && <PaymentModal student={student} onClose={() => setShowModal(false)} onSuccess={handlePaySuccess} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/students")}>← Back</button>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{student.name}</h2>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
              {student.id} · {student.rollNo} · {student.class} {student.stream}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {student.payments.length > 0 && (
            <button className="btn btn-ghost" onClick={() => navigate(`/receipt/${id}/${student.payments[student.payments.length - 1].id}`)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Last Receipt
            </button>
          )}
          {student.balance > 0 && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Collect Fee
            </button>
          )}
        </div>
      </div>

      {/* Fee summary bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 16 }}>
            {[
              { label: "Total Fee", value: fmt(student.totalFee), color: "var(--text)" },
              { label: "Amount Paid", value: fmt(student.paidAmount), color: "var(--success)" },
              { label: "Balance Due", value: fmt(student.balance), color: student.balance > 0 ? "var(--danger)" : "var(--success)" },
              { label: "Status", value: <StatusBadge status={student.status} />, color: "" },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${pct}%`, background: pct === 100 ? "var(--success)" : "var(--primary)" }} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{pct}% collected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="tabs">
            <button className={`tab ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>Student Details</button>
            <button className={`tab ${tab === "fees" ? "active" : ""}`} onClick={() => setTab("fees")}>Fee Structure</button>
            <button className={`tab ${tab === "payments" ? "active" : ""}`} onClick={() => setTab("payments")}>Payment History ({student.payments.length})</button>
          </div>
        </div>

        <div className="card-body">
          {tab === "details" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px 24px" }}>
              {[
                { label: "Full Name",     value: student.name,         span: 1 },
                { label: "Student ID",    value: student.id,           span: 1 },
                { label: "Roll Number",   value: student.rollNo,       span: 1 },
                { label: "Date of Birth", value: student.dob,          span: 1 },
                { label: "Mobile",        value: student.phone,        span: 1 },
                { label: "Class",         value: student.class,        span: 1 },
                { label: "Stream",        value: student.stream,       span: 1 },
                { label: "Course",        value: student.course || "—", span: 1 },
                { label: "Academic Year", value: student.academicYear, span: 1 },
                { label: "Enrolled On",   value: student.enrolledOn,   span: 1 },
                { label: "Email",         value: student.email,        span: 3 },
                { label: "Address",       value: student.address,      span: 3 },
              ].map(f => (
                <div key={f.label} style={{ gridColumn: `span ${f.span}`, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)", wordBreak: "break-word" }}>{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === "fees" && (
            <table className="fee-table" style={{ maxWidth: 400 }}>
              <tbody>
                <tr><td>Tuition Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(student.feeStructure.tuition)}</td></tr>
                <tr><td>Examination Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(student.feeStructure.exam)}</td></tr>
                {student.feeStructure.lab > 0 && <tr><td>Lab / Practical Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(student.feeStructure.lab)}</td></tr>}
                <tr><td>Library & Miscellaneous</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(student.feeStructure.misc)}</td></tr>
                <tr className="fee-total">
                  <td>Total Annual Fee</td>
                  <td style={{ textAlign: "right", color: "var(--primary)", fontSize: 16 }}>{fmt(student.totalFee)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === "payments" && (
            student.payments.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <div>No payments recorded yet</div>
                {student.balance > 0 && <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}>Collect Fee</button>}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Receipt No.</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.payments.map(p => (
                      <tr key={p.id}>
                        <td><span style={{ fontFamily: "monospace", fontSize: 12.5 }}>{p.receiptNo}</span></td>
                        <td>{p.date}</td>
                        <td style={{ fontWeight: 700, color: "var(--success)" }}>{fmt(p.amount)}</td>
                        <td>{p.mode}</td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/receipt/${student.id}/${p.id}`)}>
                              Print Receipt
                            </button>
                            <SmsResendButton student={student} payment={p} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
