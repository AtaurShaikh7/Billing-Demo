import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents, recordPayment } from "../data/students";

function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

function StatusBadge({ status }) {
  const cls = status === "Paid" ? "badge-paid" : status === "Partial" ? "badge-partial" : "badge-pending";
  return <span className={`badge-status ${cls}`}>{status}</span>;
}

function PaymentModal({ student, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");
  const [error, setError] = useState("");

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
    onSuccess(updated, paymentId);
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
              <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Fee</div><div style={{ fontWeight: 700 }}>{fmt(student.totalFee)}</div></div>
              <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Paid</div><div style={{ fontWeight: 700, color: "var(--success)" }}>{fmt(student.paidAmount)}</div></div>
              <div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Balance</div><div style={{ fontWeight: 700, color: "var(--danger)" }}>{fmt(student.balance)}</div></div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Payment Amount (₹) *</label>
            <input
              type="number"
              placeholder={`Max: ${student.balance}`}
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(""); }}
              min={1} max={student.balance}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 4 }}>
            <label>Payment Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              {["Cash", "UPI", "NEFT", "Cheque", "DD"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          {error && <div className="error-msg" style={{ marginTop: 6 }}>{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePay}>Collect & Generate Receipt</button>
        </div>
      </div>
    </div>
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
                      <th>Action</th>
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
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/receipt/${student.id}/${p.id}`)}>
                            Print Receipt
                          </button>
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
