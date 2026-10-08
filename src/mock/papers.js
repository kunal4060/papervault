/**
 * PaperVault — mock papers (30).
 * Mirrors BACKEND_PLAN.md §3.3 Paper / PaperAnalysis interfaces.
 *
 * aiAnalysis is generated from per-subject templates with small per-year
 * variation, mirroring what Gemini's syllabus-aware analysis would produce
 * (§5B): every question mapped to a syllabus module.
 */

// --- Analysis templates per subject (percentages sum ~100) -----------------
const ANALYSIS_TEMPLATES = {
  "subj-dsa": {
    topics: [
      { module: 3, moduleTitle: "Stacks & Queues", percentage: 40 },
      { module: 1, moduleTitle: "Algorithm Complexity & Arrays", percentage: 25 },
      { module: 5, moduleTitle: "Graphs", percentage: 20 },
      { module: 2, moduleTitle: "Linked Lists", percentage: 15 },
    ],
    patterns: { marks: { "5": 2, "10": 2, "2": 4 }, types: ["descriptive", "MCQ"] },
    syllabusCoverage: "Module 4 (Trees) and Module 6 (Hashing) had no questions in this paper.",
    tip: "Stacks & Queues pakka kar lo — har saal sabse zyada yahi se aata hai!",
  },
  "subj-ai": {
    topics: [
      { module: 2, moduleTitle: "Search Algorithms", percentage: 35 },
      { module: 4, moduleTitle: "Machine Learning Basics", percentage: 30 },
      { module: 3, moduleTitle: "Knowledge Representation & Reasoning", percentage: 20 },
      { module: 1, moduleTitle: "Introduction to AI & Agents", percentage: 15 },
    ],
    patterns: { marks: { "5": 3, "10": 1, "2": 5 }, types: ["descriptive", "MCQ"] },
    syllabusCoverage: "Module 5 (Neural Networks & NLP) and Module 6 (Ethics) had no questions.",
    tip: "A* search aur decision trees — dono almost har paper me aate hain!",
  },
  "subj-coa": {
    topics: [
      { module: 3, moduleTitle: "CPU Organization", percentage: 35 },
      { module: 2, moduleTitle: "Data Representation & ALU", percentage: 25 },
      { module: 4, moduleTitle: "Memory Hierarchy", percentage: 25 },
      { module: 1, moduleTitle: "Digital Logic Fundamentals", percentage: 15 },
    ],
    patterns: { marks: { "5": 2, "10": 2, "2": 4 }, types: ["descriptive", "numerical"] },
    syllabusCoverage: "Module 5 (I/O & System Design) had no questions in this paper.",
    tip: "Pipelining aur cache numericals — ye do topics har FAT me pakke hain!",
  },
  "subj-dms": {
    topics: [
      { module: 1, moduleTitle: "Mathematical Logic", percentage: 30 },
      { module: 3, moduleTitle: "Combinatorics", percentage: 30 },
      { module: 4, moduleTitle: "Graph Theory", percentage: 25 },
      { module: 2, moduleTitle: "Sets, Relations & Functions", percentage: 15 },
    ],
    patterns: { marks: { "5": 3, "10": 1, "2": 5 }, types: ["descriptive", "proofs"] },
    syllabusCoverage: "Module 5 (Algebraic Structures) had no questions in this paper.",
    tip: "Truth tables aur recurrence relations — proof wale questions yahi se!",
  },
  "subj-os": {
    topics: [
      { module: 2, moduleTitle: "Process Scheduling", percentage: 35 },
      { module: 3, moduleTitle: "Deadlocks", percentage: 30 },
      { module: 4, moduleTitle: "Memory Management", percentage: 20 },
      { module: 1, moduleTitle: "Introduction & System Calls", percentage: 15 },
    ],
    patterns: { marks: { "5": 2, "10": 2, "2": 4 }, types: ["descriptive", "numerical"] },
    syllabusCoverage: "File systems module had no questions in this paper.",
    tip: "Banker's algorithm ka numerical — CAT-2 me almost guaranteed!",
  },
  "subj-dbms": {
    topics: [
      { module: 2, moduleTitle: "SQL & Relational Algebra", percentage: 35 },
      { module: 3, moduleTitle: "Normalization", percentage: 30 },
      { module: 4, moduleTitle: "Transactions", percentage: 20 },
      { module: 1, moduleTitle: "ER Model", percentage: 15 },
    ],
    patterns: { marks: { "5": 3, "10": 1, "2": 5 }, types: ["descriptive", "queries"] },
    syllabusCoverage: "Indexing module had no questions in this paper.",
    tip: "SQL queries likhna aana chahiye — 10-mark me ek query pakki!",
  },
  "subj-cn": {
    topics: [
      { module: 2, moduleTitle: "Data Link Layer", percentage: 30 },
      { module: 3, moduleTitle: "Network Layer & Routing", percentage: 30 },
      { module: 4, moduleTitle: "Transport Layer", percentage: 25 },
      { module: 1, moduleTitle: "Introduction & OSI Model", percentage: 15 },
    ],
    patterns: { marks: { "5": 2, "10": 2, "2": 4 }, types: ["descriptive", "numerical"] },
    syllabusCoverage: "Application layer had no questions in this paper.",
    tip: "Subnetting ke numericals — har paper me 10 marks pakke!",
  },
  "subj-math": {
    topics: [
      { module: 2, moduleTitle: "Differential Equations", percentage: 35 },
      { module: 3, moduleTitle: "Linear Algebra", percentage: 30 },
      { module: 1, moduleTitle: "Calculus", percentage: 20 },
      { module: 4, moduleTitle: "Probability", percentage: 15 },
    ],
    patterns: { marks: { "5": 4, "10": 2 }, types: ["numerical"] },
    syllabusCoverage: "All modules covered in this paper.",
    tip: "Eigenvalues ka 10-mark question — har FAT me aata hai!",
  },
  "subj-phy": {
    topics: [
      { module: 2, moduleTitle: "Quantum Mechanics", percentage: 35 },
      { module: 1, moduleTitle: "Oscillations & Waves", percentage: 30 },
      { module: 3, moduleTitle: "Electromagnetism", percentage: 20 },
      { module: 4, moduleTitle: "Semiconductors", percentage: 15 },
    ],
    patterns: { marks: { "5": 3, "10": 1, "2": 5 }, types: ["descriptive", "numerical"] },
    syllabusCoverage: "All modules covered in this paper.",
    tip: "Schrodinger equation derivation — likhna aana chahiye!",
  },
  "subj-chy": {
    topics: [
      { module: 1, moduleTitle: "Atomic Structure", percentage: 30 },
      { module: 2, moduleTitle: "Thermodynamics", percentage: 30 },
      { module: 3, moduleTitle: "Electrochemistry", percentage: 25 },
      { module: 4, moduleTitle: "Polymers", percentage: 15 },
    ],
    patterns: { marks: { "5": 3, "10": 1, "2": 5 }, types: ["descriptive", "numerical"] },
    syllabusCoverage: "All modules covered in this paper.",
    tip: "Nernst equation ke numericals — easy marks!",
  },
  "subj-ent": {
    topics: [
      { module: 2, moduleTitle: "Business Models", percentage: 35 },
      { module: 1, moduleTitle: "Entrepreneurship Basics", percentage: 30 },
      { module: 3, moduleTitle: "Funding & Finance", percentage: 20 },
      { module: 4, moduleTitle: "Case Studies", percentage: 15 },
    ],
    patterns: { marks: { "5": 4, "10": 2 }, types: ["descriptive", "case-study"] },
    syllabusCoverage: "All modules covered in this paper.",
    tip: "Ek startup case study yaad kar lo — 10 marks pakke!",
  },
  "subj-sts": {
    topics: [
      { module: 1, moduleTitle: "Aptitude — Numbers", percentage: 40 },
      { module: 2, moduleTitle: "Logical Reasoning", percentage: 35 },
      { module: 3, moduleTitle: "Verbal Ability", percentage: 25 },
    ],
    patterns: { marks: { "1": 20 }, types: ["MCQ"] },
    syllabusCoverage: "All sections covered — 20 MCQs, 1 mark each.",
    tip: "Speed matters — pehle easy MCQs karo, tough ko mark karke aage badho!",
  },
};

// Question-number pools per topic index (mock of Gemini's Q mapping)
const QNUMS = [
  ["Q2", "Q5", "Q7", "Q9"],
  ["Q1", "Q3", "Q8"],
  ["Q4", "Q10"],
  ["Q6"],
];

function buildAnalysis(subjectId, year, examType) {
  const t = ANALYSIS_TEMPLATES[subjectId];
  // small deterministic variation by year so papers don't look identical
  const jitter = (year % 3) * 2 - 2; // -2, 0, +2
  const topics = t.topics.map((tp, i) => ({
    module: tp.module,
    moduleTitle: tp.moduleTitle,
    percentage: Math.max(5, tp.percentage + (i === 0 ? jitter : -Math.round(jitter / 3))),
    questionCount: QNUMS[i] ? QNUMS[i].length : 1,
    questionNumbers: QNUMS[i] || ["Q1"],
  }));
  return {
    topics,
    patterns: t.patterns,
    syllabusCoverage: t.syllabusCoverage,
    tip: t.tip,
    analyzedAt: `${year}-12-01T08:00:00.000Z`,
  };
}

// --- Paper factory -----------------------------------------------------------
let seq = 0;
function paper({ subjectId, subjectCode, examType, year, slot, faculty, uploader, downloads, views }) {
  seq += 1;
  const code = subjectCode.replace(/[^A-Z0-9]/g, "");
  const fileName = `${code}_${examType.replace(" ", "")}_${year}_${slot}.pdf`;
  return {
    id: `paper-${String(seq).padStart(3, "0")}`,
    subjectId,
    subjectCode,
    examType,
    year,
    slot,
    faculty,
    fileUrl: `https://storage.mock/papers/${code}/${fileName}`,
    fileName,
    fileHash: `mocksha256-${subjectId}-${year}-${slot}`.padEnd(64, "0").slice(0, 64),
    textEmbedding: [],
    uploadedBy: `uid-${uploader.toLowerCase().replace(/\s+/g, "-")}`,
    uploaderName: uploader,
    status: "approved",
    aiAnalysis: buildAnalysis(subjectId, year, examType),
    downloads,
    views,
    createdAt: `${year}-11-20T10:00:00.000Z`,
  };
}

// --- 30 papers ---------------------------------------------------------------
export const papers = [
  // DSA (4)
  paper({ subjectId: "subj-dsa", subjectCode: "CSE2001", examType: "CAT-1", year: 2023, slot: "A1", faculty: "Dr. Rajesh Kumar", uploader: "Arjun Patel", downloads: 1240, views: 3120 }),
  paper({ subjectId: "subj-dsa", subjectCode: "CSE2001", examType: "CAT-2", year: 2024, slot: "F1", faculty: "Dr. Rajesh Kumar", uploader: "Priya Nair", downloads: 2310, views: 5840 }),
  paper({ subjectId: "subj-dsa", subjectCode: "CSE2002", examType: "CAT-1", year: 2025, slot: "B2", faculty: "Prof. Vikram Singh", uploader: "Rahul Verma", downloads: 1875, views: 4210 }),
  paper({ subjectId: "subj-dsa", subjectCode: "CSE2002", examType: "FAT", year: 2025, slot: "F1", faculty: "Prof. Vikram Singh", uploader: "Sneha Iyer", downloads: 3420, views: 8930 }),
  // AI (4)
  paper({ subjectId: "subj-ai", subjectCode: "CSE3002", examType: "CAT-1", year: 2023, slot: "C1", faculty: "Dr. Sneha Reddy", uploader: "Vikram Reddy", downloads: 980, views: 2540 }),
  paper({ subjectId: "subj-ai", subjectCode: "CSE3002", examType: "CAT-2", year: 2024, slot: "G1", faculty: "Dr. Sneha Reddy", uploader: "Ananya Sharma", downloads: 1750, views: 4320 }),
  paper({ subjectId: "subj-ai", subjectCode: "CSE3003", examType: "CAT-2", year: 2025, slot: "A2", faculty: "Dr. Amit Verma", uploader: "Karan Singh", downloads: 2100, views: 5180 }),
  paper({ subjectId: "subj-ai", subjectCode: "CSE3003", examType: "FAT", year: 2025, slot: "G1", faculty: "Dr. Amit Verma", uploader: "Divya Menon", downloads: 2980, views: 7640 }),
  // COA (4)
  paper({ subjectId: "subj-coa", subjectCode: "CSA2001", examType: "CAT-1", year: 2023, slot: "D1", faculty: "Prof. Suresh Babu", uploader: "Arjun Patel", downloads: 860, views: 2130 }),
  paper({ subjectId: "subj-coa", subjectCode: "CSA2001", examType: "FAT", year: 2024, slot: "E2", faculty: "Prof. Suresh Babu", uploader: "Priya Nair", downloads: 1540, views: 3890 }),
  paper({ subjectId: "subj-coa", subjectCode: "ECE2002", examType: "CAT-1", year: 2025, slot: "D1", faculty: "Dr. Kavitha Nair", uploader: "Rahul Verma", downloads: 1120, views: 2760 }),
  paper({ subjectId: "subj-coa", subjectCode: "ECE2002", examType: "CAT-2", year: 2025, slot: "B1", faculty: "Dr. Kavitha Nair", uploader: "Sneha Iyer", downloads: 1980, views: 4950 }),
  // DMS (4)
  paper({ subjectId: "subj-dms", subjectCode: "BIT1001", examType: "CAT-1", year: 2023, slot: "E1", faculty: "Dr. Meera Krishnan", uploader: "Vikram Reddy", downloads: 1100, views: 2870 }),
  paper({ subjectId: "subj-dms", subjectCode: "BIT1001", examType: "CAT-2", year: 2024, slot: "C2", faculty: "Dr. Meera Krishnan", uploader: "Ananya Sharma", downloads: 1890, views: 4620 }),
  paper({ subjectId: "subj-dms", subjectCode: "MAT1003", examType: "FAT", year: 2024, slot: "A1", faculty: "Dr. Anand Rao", uploader: "Karan Singh", downloads: 2460, views: 6180 }),
  paper({ subjectId: "subj-dms", subjectCode: "MAT1003", examType: "CAT-1", year: 2025, slot: "F2", faculty: "Dr. Anand Rao", uploader: "Divya Menon", downloads: 1340, views: 3210 }),
  // OS (3)
  paper({ subjectId: "subj-os", subjectCode: "CSE2005", examType: "CAT-2", year: 2024, slot: "G2", faculty: "Prof. Arjun Mehta", uploader: "Arjun Patel", downloads: 1670, views: 4150 }),
  paper({ subjectId: "subj-os", subjectCode: "CSE2006", examType: "CAT-1", year: 2025, slot: "C1", faculty: "Dr. Divya Iyer", uploader: "Priya Nair", downloads: 1230, views: 2980 }),
  paper({ subjectId: "subj-os", subjectCode: "CSE2006", examType: "FAT", year: 2025, slot: "D2", faculty: "Dr. Divya Iyer", uploader: "Rahul Verma", downloads: 2740, views: 6920 }),
  // DBMS (3)
  paper({ subjectId: "subj-dbms", subjectCode: "CSE2004", examType: "CAT-1", year: 2024, slot: "B1", faculty: "Prof. Lakshmi Venkat", uploader: "Sneha Iyer", downloads: 1420, views: 3560 }),
  paper({ subjectId: "subj-dbms", subjectCode: "CSE2004", examType: "CAT-2", year: 2025, slot: "E1", faculty: "Prof. Lakshmi Venkat", uploader: "Vikram Reddy", downloads: 1890, views: 4730 }),
  paper({ subjectId: "subj-dbms", subjectCode: "CSE2004", examType: "FAT", year: 2025, slot: "A2", faculty: "Prof. Lakshmi Venkat", uploader: "Ananya Sharma", downloads: 2610, views: 6480 }),
  // CN (2)
  paper({ subjectId: "subj-cn", subjectCode: "CSE3001", examType: "CAT-2", year: 2024, slot: "F2", faculty: "Dr. Rajesh Kumar", uploader: "Karan Singh", downloads: 1180, views: 2940 }),
  paper({ subjectId: "subj-cn", subjectCode: "CSE3004", examType: "FAT", year: 2025, slot: "B2", faculty: "Dr. Amit Verma", uploader: "Divya Menon", downloads: 2050, views: 5120 }),
  // Math (2)
  paper({ subjectId: "subj-math", subjectCode: "MAT1002", examType: "CAT-1", year: 2024, slot: "A1", faculty: "Dr. Anand Rao", uploader: "Arjun Patel", downloads: 2210, views: 5680 }),
  paper({ subjectId: "subj-math", subjectCode: "MAT1003", examType: "FAT", year: 2025, slot: "G2", faculty: "Dr. Meera Krishnan", uploader: "Priya Nair", downloads: 3150, views: 7920 }),
  // Physics (1)
  paper({ subjectId: "subj-phy", subjectCode: "PHY1001", examType: "FAT", year: 2024, slot: "C2", faculty: "Dr. Kavitha Nair", uploader: "Rahul Verma", downloads: 1480, views: 3720 }),
  // Chemistry (1)
  paper({ subjectId: "subj-chy", subjectCode: "CHY1001", examType: "CAT-2", year: 2025, slot: "D2", faculty: "Dr. Sneha Reddy", uploader: "Sneha Iyer", downloads: 960, views: 2380 }),
  // Entrepreneurship (1)
  paper({ subjectId: "subj-ent", subjectCode: "ENT1001", examType: "FAT", year: 2025, slot: "E2", faculty: "Prof. Vikram Singh", uploader: "Vikram Reddy", downloads: 720, views: 1890 }),
  // STS (1)
  paper({ subjectId: "subj-sts", subjectCode: "STS2010", examType: "CAT-2", year: 2025, slot: "F1", faculty: "Prof. Arjun Mehta", uploader: "Ananya Sharma", downloads: 1830, views: 4510 }),
];

export const getPapersBySubject = (subjectId) =>
  papers.filter((p) => p.subjectId === subjectId && p.status === "approved");

export const getPapersByYear = (subjectId, year) =>
  getPapersBySubject(subjectId).filter((p) => p.year === year);

export const getPaperById = (id) => papers.find((p) => p.id === id);

export const getTrendingPapers = (limit = 5) =>
  [...papers].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
