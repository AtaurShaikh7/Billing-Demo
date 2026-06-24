export const FEE_STRUCTURE = {
  Science: { tuition: 18000, exam: 1200, lab: 2500, misc: 800 },
  Commerce: { tuition: 16000, exam: 1200, lab: 0, misc: 800 },
  Arts: { tuition: 15000, exam: 1200, lab: 0, misc: 800 },
};

export const STREAMS = ["Science", "Commerce", "Arts"];
export const CLASSES = ["FY (11th)", "SY (12th)"];

function totalFee(stream) {
  const f = FEE_STRUCTURE[stream];
  return f.tuition + f.exam + f.lab + f.misc;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  const stream = STREAMS[i % 3];
  const cls = CLASSES[i % 2];
  const total = totalFee(stream);
  const status = i % 3 === 0 ? "Paid" : i % 3 === 1 ? "Partial" : "Pending";
  const paid =
    status === "Paid" ? total : status === "Partial" ? rand(3000, total - 2000) : 0;
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  return {
    id: `SMC${String(2401 + i).padStart(4, "0")}`,
    rollNo: `${cls.slice(0, 2).toUpperCase()}${stream.slice(0, 2).toUpperCase()}${String(i + 1).padStart(3, "0")}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@student.smcmumbra.in`,
    phone: `9${rand(100000000, 999999999)}`,
    dob: `${rand(1, 28).toString().padStart(2, "0")}/${rand(1, 12).toString().padStart(2, "0")}/200${rand(6, 8)}`,
    address: `${rand(1, 99)}, ${ln} Nagar, Mumbra, Thane`,
    class: cls,
    stream,
    academicYear: "2025–26",
    feeStructure: FEE_STRUCTURE[stream],
    totalFee: total,
    paidAmount: paid,
    balance: total - paid,
    status,
    payments: paid > 0
      ? [
          {
            id: `PAY${String(i + 1).padStart(4, "0")}`,
            date: `${rand(1, 28).toString().padStart(2, "0")} Jun 2025`,
            amount: paid,
            mode: ["Cash", "UPI", "NEFT"][i % 3],
            receiptNo: `SMC-REC-${String(2401 + i).padStart(5, "0")}`,
          },
        ]
      : [],
    enrolledOn: `${rand(1, 30)} Jun 2025`,
  };
});

const STORAGE_KEY = "smc_billing_students";

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
  const newStudent = {
    ...student,
    id: newId,
    rollNo: `${student.class.slice(0, 2).toUpperCase()}${student.stream.slice(0, 2).toUpperCase()}${String(students.length + 1).padStart(3, "0")}`,
    totalFee: totalFee(student.stream),
    paidAmount: 0,
    balance: totalFee(student.stream),
    status: "Pending",
    payments: [],
    enrolledOn: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    feeStructure: FEE_STRUCTURE[student.stream],
  };
  const updated = [...students, newStudent];
  saveStudents(updated);
  return updated;
}

export function recordPayment(studentId, payment) {
  const students = getStudents();
  const updated = students.map((s) => {
    if (s.id !== studentId) return s;
    const newPaid = s.paidAmount + payment.amount;
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
