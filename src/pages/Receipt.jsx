import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents } from "../data/students";

const NUM = { fontFamily: "'Roboto', sans-serif" };

function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

function words(n) {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n === 0) return "Zero";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " " + ones[n%10] : "");
  if (n < 1000) return ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " " + words(n%100) : "");
  if (n < 100000) return words(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " " + words(n%1000) : "");
  if (n < 10000000) return words(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " " + words(n%100000) : "");
  return words(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " " + words(n%10000000) : "");
}

const FEE_NOTE_LABELS = {
  enrollment:  "Enrollment Fee",
  eligibility: "Eligibility Fee",
  exam:        "Exam Fee",
};

export default function Receipt() {
  const { studentId, paymentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const students = getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) { navigate("/students"); return; }
    const payment = student.payments.find(p => p.id === paymentId);
    if (!payment) { navigate(`/students/${studentId}`); return; }
    setData({ student, payment });
  }, [studentId, paymentId]);

  if (!data) return null;

  const { student, payment } = data;
  const prevPaid   = student.paidAmount - payment.amount;
  const newBalance = student.totalFee - student.paidAmount;
  const feeNotes   = payment.feeNotes || {};
  const hasNotes   = Object.keys(FEE_NOTE_LABELS).some(k => feeNotes[k] !== undefined);

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5ff", padding:"24px 20px" }}>
      {/* Print actions */}
      <div className="no-print" style={{ maxWidth:680, margin:"0 auto 16px", display:"flex", gap:10 }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/students/${studentId}`)}>← Back</button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16 }}>
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print Receipt
        </button>
      </div>

      <div className="card receipt-card">
        {/* College header */}
        <div className="receipt-header">
          <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width:28, height:28 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div className="receipt-college">St. Mary Degree College</div>
            <div className="receipt-sub">Near Station Road, Mumbra, Thane – 400612 | Tel: 022-2778XXXX</div>
            <div className="receipt-sub">Email: office@stmarymumbra.edu.in | Affiliated to Maharashtra Board (MSBSHSE)</div>
          </div>
        </div>

        <div className="receipt-body">
          <div className="receipt-title">Fee Payment Receipt</div>

          {/* Receipt meta */}
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:12.5 }}>
            <div>
              <span style={{ color:"var(--muted)", fontWeight:600 }}>Receipt No.: </span>
              <strong style={NUM}>{payment.receiptNo}</strong>
            </div>
            <div>
              <span style={{ color:"var(--muted)", fontWeight:600 }}>Date: </span>
              <strong style={NUM}>{payment.date}</strong>
            </div>
          </div>

          {/* Student info */}
          <div className="receipt-row">
            <div className="receipt-field"><label>Student Name</label><p>{student.name}</p></div>
            <div className="receipt-field"><label>Student ID</label><p style={NUM}>{student.id}</p></div>
            <div className="receipt-field"><label>Roll Number</label><p style={NUM}>{student.rollNo}</p></div>
            <div className="receipt-field"><label>Course</label><p>{student.course || student.stream} — {student.class}</p></div>
            <div className="receipt-field"><label>Academic Year</label><p style={NUM}>{student.academicYear}</p></div>
            <div className="receipt-field"><label>Payment Mode</label><p>{payment.mode}</p></div>
          </div>

          {/* ── Amount paid — prominent ── */}
          <div className="receipt-amount-box" style={{ marginTop:8 }}>
            <div>
              <div className="label">Amount Paid This Transaction</div>
              <div style={{ fontSize:12, opacity:.75, marginTop:3 }}>
                In words: {words(payment.amount)} Rupees Only
              </div>
            </div>
            <div className="amount" style={NUM}>{fmt(payment.amount)}</div>
          </div>

          {/* Balance summary */}
          <div style={{ display:"flex", gap:16, marginTop:14 }}>
            <div style={{ flex:1, background:"#f0f4ff", borderRadius:8, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>Total Fee</div>
              <div style={{ fontWeight:700, fontSize:15, ...NUM }}>{fmt(student.totalFee)}</div>
            </div>
            <div style={{ flex:1, background:"#f0f4ff", borderRadius:8, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>Total Paid to Date</div>
              <div style={{ fontWeight:700, fontSize:15, color:"var(--success)", ...NUM }}>{fmt(student.paidAmount)}</div>
            </div>
            <div style={{ flex:1, background: newBalance > 0 ? "#fff5f5" : "#f0fff4", borderRadius:8, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>Balance Remaining</div>
              <div style={{ fontWeight:700, fontSize:15, color: newBalance > 0 ? "var(--danger)" : "var(--success)", ...NUM }}>
                {newBalance > 0 ? fmt(newBalance) : "FULLY PAID ✓"}
              </div>
            </div>
          </div>

          {/* ── Notes section (fee toggles) ── */}
          {hasNotes && (
            <div style={{ marginTop:20, border:"1px solid var(--border)", borderRadius:10, overflow:"hidden" }}>
              <div style={{ background:"#f8fafc", padding:"10px 16px", borderBottom:"1px solid var(--border)", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".06em" }}>
                Notes
              </div>
              <div style={{ padding:"6px 16px" }}>
                {Object.entries(FEE_NOTE_LABELS).map(([key, label]) => (
                  <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f1f5f9" }}>
                    <span style={{ fontSize:13, color:"var(--text)" }}>{label}</span>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:"2px 12px", borderRadius:999,
                      background: feeNotes[key] ? "#dcfce7" : "#fee2e2",
                      color:      feeNotes[key] ? "#15803d" : "#b91c1c",
                    }}>
                      {feeNotes[key] ? "Paid" : "Not Paid"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="receipt-sign" style={{ marginTop:28 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:8, width:140 }}>Student Signature</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:8, width:180 }}>Cashier / Fee Collector</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:8, width:160 }}>Principal's Stamp</div>
            </div>
          </div>
        </div>

        <div className="receipt-footer">
          This is a computer-generated receipt. No signature required. — St. Mary Degree College, Mumbra
        </div>
      </div>
    </div>
  );
}
