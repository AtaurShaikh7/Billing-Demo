import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addStudent, FEE_STRUCTURE, STREAMS, CLASSES } from "../data/students";

function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }

const PAYMENT_MODES = ["Cash", "UPI", "NEFT", "Cheque", "DD"];

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", dob: "",
    address: "", class: "", stream: "", academicYear: "2026–27",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  const fees = form.stream ? FEE_STRUCTURE[form.stream] : null;
  const total = fees ? fees.tuition + fees.exam + fees.lab + fees.misc : 0;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = "Valid 10-digit phone required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.dob) e.dob = "Date of birth required";
    if (!form.class) e.class = "Select a class";
    if (!form.stream) e.stream = "Select a stream";
    if (!form.address.trim()) e.address = "Address required";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    addStudent(form);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 48 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{ width: 32, height: 32 }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Student Enrolled!</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          {form.name} has been added to {form.class} {form.stream} for AY 2026–27.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => navigate("/students")}>View All Students</button>
          <button className="btn btn-ghost" onClick={() => { setForm({ name:"",email:"",phone:"",dob:"",address:"",class:"",stream:"",academicYear:"2026–27" }); setSaved(false); setErrors({}); }}>
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Personal Details */}
          <div className="card">
            <div className="card-header">Personal Details</div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="e.g. Aryan Sharma" value={form.name} onChange={e => set("name", e.target.value)} className={errors.name ? "input-error" : ""} />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className={errors.dob ? "input-error" : ""} />
                  {errors.dob && <span className="error-msg">{errors.dob}</span>}
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input type="tel" placeholder="10-digit mobile" value={form.phone} onChange={e => set("phone", e.target.value)} className={errors.phone ? "input-error" : ""} maxLength={10} />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" placeholder="student@example.com" value={form.email} onChange={e => set("email", e.target.value)} className={errors.email ? "input-error" : ""} />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>
                <div className="form-group span-2">
                  <label>Residential Address *</label>
                  <textarea rows={2} placeholder="House/Flat no., Area, Mumbra, Thane" value={form.address} onChange={e => set("address", e.target.value)} className={errors.address ? "input-error" : ""} />
                  {errors.address && <span className="error-msg">{errors.address}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="card">
            <div className="card-header">Academic Details</div>
            <div className="card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Class *</label>
                  <select value={form.class} onChange={e => set("class", e.target.value)} className={errors.class ? "input-error" : ""}>
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.class && <span className="error-msg">{errors.class}</span>}
                </div>
                <div className="form-group">
                  <label>Stream *</label>
                  <select value={form.stream} onChange={e => set("stream", e.target.value)} className={errors.stream ? "input-error" : ""}>
                    <option value="">Select stream</option>
                    {STREAMS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {errors.stream && <span className="error-msg">{errors.stream}</span>}
                </div>
                <div className="form-group">
                  <label>Academic Year</label>
                  <input type="text" value={form.academicYear} readOnly style={{ background: "#f8fafc", cursor: "not-allowed" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Fee Preview */}
          {fees && (
            <div className="card">
              <div className="card-header">Fee Structure — {form.stream}</div>
              <div className="card-body">
                <table className="fee-table">
                  <tbody>
                    <tr><td>Tuition Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(fees.tuition)}</td></tr>
                    <tr><td>Examination Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(fees.exam)}</td></tr>
                    {fees.lab > 0 && <tr><td>Lab / Practical Fee</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(fees.lab)}</td></tr>}
                    <tr><td>Library & Miscellaneous</td><td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(fees.misc)}</td></tr>
                    <tr className="fee-total">
                      <td>Total Annual Fee</td>
                      <td style={{ textAlign: "right", color: "var(--primary)", fontSize: 16 }}>{fmt(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/students")}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Enrol Student
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
