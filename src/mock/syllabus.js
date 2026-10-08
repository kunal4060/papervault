/**
 * PaperVault — mock syllabus data.
 * Mirrors BACKEND_PLAN.md §3.2 Syllabus / SyllabusModule interfaces.
 * Doc ID = subjectId. Admin uploads the official syllabus; notes and the
 * AI analysis link to these modules.
 */

export const syllabi = [
  {
    subjectId: "subj-dsa",
    modules: [
      {
        number: 1,
        title: "Algorithm Complexity & Arrays",
        topics: ["time complexity", "space complexity", "Big-O notation", "arrays", "searching", "sorting basics"],
      },
      {
        number: 2,
        title: "Linked Lists",
        topics: ["singly linked list", "doubly linked list", "circular list", "insertion", "deletion", "reversal"],
      },
      {
        number: 3,
        title: "Stacks & Queues",
        topics: ["stack", "queue", "infix to postfix", "applications", "priority queue", "deque"],
      },
      {
        number: 4,
        title: "Trees",
        topics: ["binary tree", "BST", "traversals", "AVL tree", "heap"],
      },
      {
        number: 5,
        title: "Graphs",
        topics: ["BFS", "DFS", "shortest path", "Dijkstra", "spanning tree", "topological sort"],
      },
      {
        number: 6,
        title: "Hashing & Advanced Sorting",
        topics: ["hash tables", "collision handling", "quick sort", "merge sort", "divide and conquer"],
      },
    ],
    pdfUrl: "https://storage.mock/syllabus/CSE2001/syllabus.pdf",
    updatedAt: "2025-08-15T10:00:00.000Z",
  },
  {
    subjectId: "subj-ai",
    modules: [
      {
        number: 1,
        title: "Introduction to AI & Agents",
        topics: ["intelligent agents", "PEAS", "environment types", "history of AI"],
      },
      {
        number: 2,
        title: "Search Algorithms",
        topics: ["BFS", "DFS", "A* search", "heuristics", "adversarial search", "minimax"],
      },
      {
        number: 3,
        title: "Knowledge Representation & Reasoning",
        topics: ["propositional logic", "first-order logic", "inference", "knowledge base"],
      },
      {
        number: 4,
        title: "Machine Learning Basics",
        topics: ["supervised learning", "regression", "classification", "decision trees", "overfitting"],
      },
      {
        number: 5,
        title: "Neural Networks & NLP Intro",
        topics: ["perceptron", "MLP", "backpropagation", "tokenization", "embeddings"],
      },
      {
        number: 6,
        title: "AI Applications & Ethics",
        topics: ["expert systems", "robotics", "bias", "AI safety", "future of AI"],
      },
    ],
    pdfUrl: "https://storage.mock/syllabus/CSE3002/syllabus.pdf",
    updatedAt: "2025-08-15T10:05:00.000Z",
  },
  {
    subjectId: "subj-coa",
    modules: [
      {
        number: 1,
        title: "Digital Logic Fundamentals",
        topics: ["number systems", "boolean algebra", "logic gates", "combinational circuits"],
      },
      {
        number: 2,
        title: "Data Representation & ALU",
        topics: ["binary arithmetic", "floating point", "ALU design", "shifters"],
      },
      {
        number: 3,
        title: "CPU Organization",
        topics: ["instruction set", "addressing modes", "datapath", "control unit", "pipelining"],
      },
      {
        number: 4,
        title: "Memory Hierarchy",
        topics: ["cache", "virtual memory", "RAM types", "memory mapping"],
      },
      {
        number: 5,
        title: "I/O & System Design",
        topics: ["I/O interfacing", "interrupts", "DMA", "bus architecture"],
      },
    ],
    pdfUrl: "https://storage.mock/syllabus/CSA2001/syllabus.pdf",
    updatedAt: "2025-08-15T10:10:00.000Z",
  },
  {
    subjectId: "subj-dms",
    modules: [
      {
        number: 1,
        title: "Mathematical Logic",
        topics: ["propositions", "truth tables", "predicates", "quantifiers", "proofs"],
      },
      {
        number: 2,
        title: "Sets, Relations & Functions",
        topics: ["sets", "relations", "equivalence", "functions", "pigeonhole principle"],
      },
      {
        number: 3,
        title: "Combinatorics",
        topics: ["counting", "permutations", "combinations", "inclusion-exclusion", "recurrence"],
      },
      {
        number: 4,
        title: "Graph Theory",
        topics: ["graphs", "Eulerian", "Hamiltonian", "trees", "planarity", "coloring"],
      },
      {
        number: 5,
        title: "Algebraic Structures",
        topics: ["groups", "rings", "fields", "lattices", "boolean algebra"],
      },
    ],
    pdfUrl: "https://storage.mock/syllabus/BIT1001/syllabus.pdf",
    updatedAt: "2025-08-15T10:15:00.000Z",
  },
];

export const getSyllabus = (subjectId) =>
  syllabi.find((s) => s.subjectId === subjectId);
