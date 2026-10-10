import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Papers from "./pages/Papers.jsx";
import PaperDetail from "./pages/PaperDetail.jsx";
import Syllabus from "./pages/Syllabus.jsx";
import Upload from "./pages/Upload.jsx";
import MyUploads from "./pages/MyUploads.jsx";
import Requests from "./pages/Requests.jsx";
import Chat from "./pages/Chat.jsx";
import AdminGate from "./pages/admin/AdminGate.jsx";

/**
 * PaperVault — tiny hash router (no dependency).
 *
 * Routes:
 *   #/                             → Home
 *   #/papers                       → papers subject grid
 *   #/papers/:subjectId            → subject detail (year tabs, AI analysis)
 *   #/papers/paper-xxx             → paper detail
 *   #/syllabus / #/syllabus/:subjectId → syllabus
 *   #/upload                       → upload flow
 *   #/my-uploads                   → upload history
 *   #/requests                     → paper requests
 *   #/chat                         → community chat
 *   #/admin[/moderation|subjects|syllabus|notes|papers|users]
 *
 * Legacy "#papers" anchors (no slash) are normalized to "#/papers".
 */

function parseHash() {
  // Query string (?q=...) strip karo — sirf path se route match hota hai.
  const raw = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const parts = raw.split("/").filter(Boolean);
  return { head: parts[0] ?? "", rest: parts.slice(1) };
}

// SEO: har route pe document title + meta description update karo.
// (Hash-router SPA me yahi sabse practical per-page SEO hai.)
const ROUTE_META = {
  "": ["PaperVault — VIT-AP Papers & Notes", "VIT-AP previous year question papers (CAT-1, CAT-2, FAT), syllabus and verified notes. Free for every student."],
  papers: ["Browse Papers — PaperVault", "Browse VIT-AP question papers by subject — CAT-1, CAT-2 and FAT papers with AI topic analysis."],
  paper: ["Paper Details — PaperVault", "View and download a VIT-AP question paper with AI-powered topic weightage and marks pattern analysis."],
  syllabus: ["Syllabus Library — PaperVault", "VIT-AP subject syllabus with module-wise breakdowns and study notes."],
  upload: ["Upload a Paper — PaperVault", "Contribute VIT-AP question papers to the vault — moderated and free for every student."],
  "my-uploads": ["My Uploads — PaperVault", "Track your PaperVault paper uploads and their moderation status."],
  requests: ["Request a Paper — PaperVault", "Request a missing VIT-AP question paper — the community helps find it."],
  chat: ["Community Chat — PaperVault", "Discuss papers, syllabus and exams with fellow VIT-AP students."],
  admin: ["Admin — PaperVault", "PaperVault administration."],
};

function applyRouteMeta(head) {
  const [title, desc] = ROUTE_META[head] ?? ROUTE_META[""];
  document.title = title;
  let tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", desc);
}

export default function App() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Route change pe SEO meta update karo (initial load + har navigation).
  useEffect(() => {
    applyRouteMeta(head);
  }, [head]);

  const { head, rest } = route;

  if (head === "papers") {
    const seg = rest[0];
    if (!seg) return <Papers />;
    // paper ids ("paper-001") → detail; anything else → subject detail.
    // key={seg} se paper change pe remount (bookmark/report state reset).
    if (seg.startsWith("paper-")) return <PaperDetail key={seg} paperId={seg} />;
    return <Papers key={seg} subjectId={seg} />;
  }

  if (head === "paper") {
    const pid = rest[0];
    if (pid) return <PaperDetail key={pid} paperId={pid} />;
    return <Papers />;
  }

  if (head === "syllabus") {
    return <Syllabus subjectId={rest[0] ?? null} />;
  }

  if (head === "upload") return <Upload />;
  if (head === "my-uploads") return <MyUploads />;
  if (head === "requests") return <Requests />;
  if (head === "chat") return <Chat />;

  if (head === "admin") {
    // Admin gate — Firebase Google auth + users/{uid}.role === "admin".
    const sub = rest[0] ?? "";
    return <AdminGate key="admin" sub={sub} />;
  }

  return <Home />;
}
