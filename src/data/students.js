/* ── Course structure ── */
export const STREAM_COURSES = {
  Science:  ["BSc", "BSc IT", "BSc CS"],
  Commerce: ["BCom", "BMS", "BAF"],
  Arts:     ["BA"],
};

export const STREAMS = ["Science", "Commerce", "Arts"];
export const CLASSES = ["FY (First Year)", "SY (Second Year)", "TY (Third Year)"];

/* Fee per course (INR/year) */
export const FEE_STRUCTURE = {
  "BSc":    { tuition: 15000, exam: 1200, lab: 2500, misc: 800 },
  "BSc IT": { tuition: 18000, exam: 1200, lab: 3000, misc: 800 },
  "BSc CS": { tuition: 18000, exam: 1200, lab: 3000, misc: 800 },
  "BCom":   { tuition: 14000, exam: 1200, lab: 0,    misc: 800 },
  "BMS":    { tuition: 16000, exam: 1200, lab: 0,    misc: 800 },
  "BAF":    { tuition: 16000, exam: 1200, lab: 0,    misc: 800 },
  "BA":     { tuition: 12000, exam: 1200, lab: 0,    misc: 800 },
};

function totalFee(course) {
  const f = FEE_STRUCTURE[course] || FEE_STRUCTURE["BA"];
  return f.tuition + f.exam + f.lab + f.misc;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Helper: pick course from stream */
const ALL_COURSES = [
  { stream: "Science",  course: "BSc"    },
  { stream: "Science",  course: "BSc IT" },
  { stream: "Science",  course: "BSc CS" },
  { stream: "Commerce", course: "BCom"   },
  { stream: "Commerce", course: "BMS"    },
  { stream: "Commerce", course: "BAF"    },
  { stream: "Arts",     course: "BA"     },
];

const firstNames = [
  "Aryan","Priya","Rohit","Sneha","Akash","Pooja","Vishal","Neha","Rahul","Anjali",
  "Aditya","Shruti","Nikhil","Deepika","Saurabh","Kavya","Kunal","Riya","Manish","Meera",
  "Harshad","Tanya","Omkar","Saloni","Pratik","Swati","Vivek","Pallavi","Gaurav","Ishita",
];
const lastNames = [
  "Sharma","Patil","Desai","Khan","Mehta","Joshi","Singh","Yadav","Mishra","Kulkarni",
  "Sawant","Shinde","More","Pawar","Naik","Chavan","Patel","Gupta","Verma","Ansari",
];

const INITIAL_STUDENTS = Array.from({ length: 30 }, (_, i) => {
  const { stream, course } = ALL_COURSES[i % ALL_COURSES.length];
  const cls   = CLASSES[i % 3];
  const total = totalFee(course);
  const status = i % 3 === 0 ? "Paid" : i % 3 === 1 ? "Partial" : "Pending";
  const paid   = status === "Paid" ? total : status === "Partial" ? rand(3000, total - 2000) : 0;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const yearCode = cls.slice(0, 2).toUpperCase(); // FY / SY / TY
  const courseCode = course.replace(/\s/g, "").slice(0, 4).toUpperCase();
  return {
    id: `SMC${String(2401 + i).padStart(4, "0")}`,
    rollNo: `${yearCode}${courseCode}${String(i + 1).padStart(3, "0")}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.smcmumbra.in`,
    phone: `9${rand(100000000, 999999999)}`,
    dob: `${rand(1, 28).toString().padStart(2, "0")}/${rand(1, 12).toString().padStart(2, "0")}/200${rand(3, 6)}`,
    address: `${rand(1, 99)}, ${ln} Nagar, Mumbra, Thane`,
    class: cls,
    stream,
    course,
    eligibilityFee: i % 4 === 0, // every 4th student has eligibility fee
    academicYear: "2026–27",
    feeStructure: FEE_STRUCTURE[course],
    totalFee: total,
    paidAmount: paid,
    balance: total - paid,
    status,
    payments: paid > 0
      ? [{
          id: `PAY${String(i + 1).padStart(4, "0")}`,
          date: `${rand(1, 28).toString().padStart(2, "0")} Jun 2026`,
          amount: paid,
          mode: ["Cash", "UPI", "NEFT"][i % 3],
          receiptNo: `SMC-REC-${String(2401 + i).padStart(5, "0")}`,
        }]
      : [],
    enrolledOn: `${rand(1, 30)} Jun 2026`,
  };
});

const STORAGE_KEY = "smc_billing_students_v2"; // bumped version → clears old data

export function getStudents() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
}

export function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function addStudent(student) {
  const students = getStudents();
  const newId = `SMC${String(2401 + students.length).padStart(4, "0")}`;
  const yearCode   = student.class.slice(0, 2).toUpperCase();
  const courseCode = student.course.replace(/\s/g, "").slice(0, 4).toUpperCase();
  const fee        = FEE_STRUCTURE[student.course] || FEE_STRUCTURE["BA"];
  const total      = fee.tuition + fee.exam + fee.lab + fee.misc;
  const newStudent = {
    ...student,
    id: newId,
    rollNo: `${yearCode}${courseCode}${String(students.length + 1).padStart(3, "0")}`,
    totalFee: total,
    paidAmount: 0,
    balance: total,
    status: "Pending",
    payments: [],
    enrolledOn: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    feeStructure: fee,
    eligibilityFee: student.eligibilityFee || false,
  };
  const updated = [...students, newStudent];
  saveStudents(updated);
  return updated;
}

export function recordPayment(studentId, payment) {
  const students = getStudents();
  const updated = students.map((s) => {
    if (s.id !== studentId) return s;
    const newPaid    = s.paidAmount + payment.amount;
    const newBalance = s.totalFee - newPaid;
    return {
      ...s,
      paidAmount: newPaid,
      balance: newBalance,
      status: newBalance <= 0 ? "Paid" : "Partial",
      payments: [...s.payments, payment],
    };
  });
  saveStudents(updated);
  return updated;
}
