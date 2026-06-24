import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudents } from "../data/students";

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
  const newBalance = student.totalFee - student.paidAmount;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px 20px" }}>
      {/* Print actions */}
      <div className="no-print" style={{ maxWidth: 680, margin: "0 auto 16px", display: "flex", gap: 10 }}>
        <button className="btn btn-ghost" onClick={() => navigate(`/students/${studentId}`)}>← Back</button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
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
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: 28, height: 28 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div className="receipt-college">St. Mary Junior College</div>
            <div className="receipt-sub">Near Station Road, Mumbra, Thane – 400612 | Tel: 022-2778XXXX</div>
            <div className="receipt-sub">Email: office@stmarymumbra.edu.in | Affiliated to Maharashtra Board (MSBSHSE)</div>
          </div>
        </div>

        <div className="receipt-body">
          <div className="receipt-title">Fee Payment Receipt</div>

          {/* Receipt meta */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 12.5 }}>
            <div>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>Receipt No.: </span>
              <strong>{payment.receiptNo}</strong>
            </div>
            <div>
              <span style={{ color: "var(--muted)", fontWeight: 600 }}>Date: </span>
              <strong>{payment.date}</strong>
            </div>
          </div>

          {/* Student info */}
          <div className="receipt-row">
            <div className="receipt-field"><label>Student Name</label><p>{student.name}</p></div>
            <div className="receipt-field"><label>Student ID</label><p>{student.id}</p></div>
            <div className="receipt-field"><label>Roll Number</label><p>{student.rollNo}</p></div>
            <div className="receipt-field"><label>Class & Stream</label><p>{student.class} – {student.stream}</p></div>
            <div className="receipt-field"><label>Academic Year</label><p>{student.academicYear}</p></div>
            <div className="receipt-field"><label>Payment Mode</label><p>{payment.mode}</p></div>
          </div>

          {/* Fee table */}
          <table className="receipt-fee-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Sr.</th>
                <th>Fee Head</th>
                <th style={{ textAlign: "right" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>Tuition Fee</td><td style={{ textAlign: "right" }}>{fmt(student.feeStructure.tuition)}</td></tr>
              <tr><td>2</td><td>Examination / Hall Ticket Fee</td><td style={{ textAlign: "right" }}>{fmt(student.feeStructure.exam)}</td></tr>
              {student.feeStructure.lab > 0 && <tr><td>3</td><td>Lab / Practical Fee</td><td style={{ textAlign: "right" }}>{fmt(student.feeStructure.lab)}</td></tr>}
              <tr><td>{student.feeStructure.lab > 0 ? 4 : 3}</td><td>Library & Miscellaneous</td><td style={{ textAlign: "right" }}>{fmt(student.feeStructure.misc)}</td></tr>
              <tr className="total-row">
                <td colSpan={2} style={{ fontWeight: 700 }}>Total Annual Fee</td>
                <td style={{ textAlign: "right" }}>{fmt(student.totalFee)}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount paid box */}
          <div className="receipt-amount-box">
            <div>
              <div className="label">Amount Paid This Transaction</div>
              <div style={{ fontSize: 12, opacity: .75, marginTop: 3 }}>
                In words: {words(payment.amount)} Rupees Only
              </div>
            </div>
            <div className="amount">{fmt(payment.amount)}</div>
          </div>

          {/* Balance summary */}
          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            <div style={{ flex: 1, background: "#f0f4ff", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Previously Paid</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{fmt(student.paidAmount - payment.amount >= 0 ? student.paidAmount - payment.amount : 0)}</div>
            </div>
            <div style={{ flex: 1, background: "#f0f4ff", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Paid to Date</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--success)" }}>{fmt(student.paidAmount)}</div>
            </div>
            <div style={{ flex: 1, background: newBalance > 0 ? "#fff5f5" : "#f0fff4", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>Balance Remaining</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: newBalance > 0 ? "var(--danger)" : "var(--success)" }}>
                {newBalance > 0 ? fmt(newBalance) : "FULLY PAID ✓"}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="receipt-sign">
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, width: 140 }}>Student Signature</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, width: 180 }}>Cashier / Fee Collector</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, width: 160 }}>Principal's Stamp</div>
            </div>
          </div>
        </div>

        <div className="receipt-footer">
          This is a computer-generated receipt. No signature required. — St. Mary Junior College, Mumbra
        </div>
      </div>
    </div>
  );
}
