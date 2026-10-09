import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Papers from "./pages/Papers.jsx";
import PaperDetail from "./pages/PaperDetail.jsx";
import Syllabus from "./pages/Syllabus.jsx";
import Upload from "./pages/Upload.jsx";
import MyUploads from "./pages/MyUploads.jsx";
import Requests from "./pages/Requests.jsx";
import Chat from "./pages/Chat.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Moderation from "./pages/admin/Moderation.jsx";
import Subjects from "./pages/admin/Subjects.jsx";
import SyllabusManager from "./pages/admin/SyllabusManager.jsx";
import NotesManager from "./pages/admin/NotesManager.jsx";
import PapersManager from "./pages/admin/PapersManager.jsx";
import Users from "./pages/admin/Users.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import { isAdminLoggedIn, adminLogout } from "./pages/admin/adminAuth.js";

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

  const { head, rest } = route;

  if (head === "papers") {
    const seg = rest[0];
    if (!seg) return <Papers />;
    // paper ids ("paper-001") → detail; anything else → subject detail.
    // key={seg} se paper change pe remount (bookmark/report state reset).
    if (seg.startsWith("paper-")) return <PaperDetail key={seg} paperId={seg} />;
    return <Papers key={seg} subjectId={seg} />;
  }

  if (head === "syllabus") {
    return <Syllabus subjectId={rest[0] ?? null} />;
  }

  if (head === "upload") return <Upload />;
  if (head === "my-uploads") return <MyUploads />;
  if (head === "requests") return <Requests />;
  if (head === "chat") return <Chat />;

  if (head === "admin") {
    // Admin login gate — mock credentials: admin / admin
    if (!isAdminLoggedIn()) {
      return <AdminLogin onSuccess={() => setRoute(parseHash())} />;
    }
    const sub = rest[0] ?? "";
    if (sub === "moderation") return <Moderation />;
    if (sub === "subjects") return <Subjects />;
    if (sub === "syllabus") return <SyllabusManager />;
    if (sub === "notes") return <NotesManager />;
    if (sub === "papers") return <PapersManager />;
    if (sub === "users") return <Users />;
    if (sub === "logout") {
      adminLogout();
      window.location.hash = "#/";
      return null;
    }
    return <Dashboard />;
  }

  return <Home />;
}
