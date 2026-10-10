import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
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
 * PaperVault — react-router (BrowserRouter) routing.
 *
 * Routes:
 *   /                                → Home
 *   /papers                          → papers subject grid
 *   /papers/:subjectId               → subject detail (year tabs, AI analysis)
 *   /papers/paper-xxx                → (legacy) paper detail — redirects to /paper/:id
 *   /paper/:paperId                  → paper detail
 *   /syllabus /syllabus/:subjectId    → syllabus
 *   /upload                          → upload flow
 *   /my-uploads                      → upload history
 *   /requests                        → paper requests
 *   /chat                            → community chat
 *   /admin[/moderation|subjects|syllabus|notes|papers|users]
 *
 * Old hash URLs (/papers, /paper/xyz, ...) are redirected to real paths
 * by <HashRedirect/> so existing shared/WhatsApp links keep working.
 * GitHub Pages serves public/404.html on unknown paths (spa-github-pages
 * pattern) which restores the URL before React mounts — see index.html.
 */

// SEO: har route pe document title + meta description update karo.
const ROUTE_META = {
  "/": ["PaperVault — VIT-AP Papers & Notes", "VIT-AP previous year question papers (CAT-1, CAT-2, FAT), syllabus and verified notes. Free for every student."],
  "/papers": ["Browse Papers — PaperVault", "Browse VIT-AP question papers by subject — CAT-1, CAT-2 and FAT papers with AI topic analysis."],
  "/paper": ["Paper Details — PaperVault", "View and download a VIT-AP question paper with AI-powered topic weightage and marks pattern analysis."],
  "/syllabus": ["Syllabus Library — PaperVault", "VIT-AP subject syllabus with module-wise breakdowns and study notes."],
  "/upload": ["Upload a Paper — PaperVault", "Contribute VIT-AP question papers to the vault — moderated and free for every student."],
  "/my-uploads": ["My Uploads — PaperVault", "Track your PaperVault paper uploads and their moderation status."],
  "/requests": ["Request a Paper — PaperVault", "Request a missing VIT-AP question paper — the community helps find it."],
  "/chat": ["Community Chat — PaperVault", "Discuss papers, syllabus and exams with fellow VIT-AP students."],
  "/admin": ["Admin — PaperVault", "PaperVault administration."],
};

function applyMeta(title, desc) {
  document.title = title;
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", desc);
}

function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    // /papers/:subjectId → dynamic subject title
    const m = pathname.match(/^\/papers\/([^/]+)\/?$/);
    if (m && !m[1].startsWith("paper-")) {
      const code = decodeURIComponent(m[1]).toUpperCase();
      applyMeta(
        `${code} Papers — PaperVault`,
        `${code} VIT-AP previous year question papers (CAT-1, CAT-2, FAT) with AI topic weightage analysis. Free download.`
      );
      return;
    }
    // /syllabus/:subjectId → dynamic subject title
    const sm = pathname.match(/^\/syllabus\/([^/]+)\/?$/);
    if (sm) {
      const code = decodeURIComponent(sm[1]).toUpperCase();
      applyMeta(
        `${code} Syllabus — PaperVault`,
        `${code} VIT-AP syllabus with module-wise breakdown and study notes.`
      );
      return;
    }
    const seg = "/" + pathname.split("/").filter(Boolean)[0];
    const [title, desc] = ROUTE_META[seg] ?? ROUTE_META["/"];
    applyMeta(title, desc);
  }, [pathname]);

  return null;
}

/** Purani #/ wali links ko naye real paths pe redirect karo. */
function HashRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const h = window.location.hash;
    if (h && h.startsWith("#/")) {
      const path = h.slice(1); // "#/papers?q=x" → "/papers?q=x"
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      navigate(path, { replace: true });
    }
  }, [navigate]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SubjectRoute() {
  const { subjectId } = useParams();
  return <Papers key={subjectId} subjectId={subjectId} />;
}

function PaperRoute() {
  const { paperId } = useParams();
  return <PaperDetail key={paperId} paperId={paperId} />;
}

function SyllabusRoute() {
  const { subjectId } = useParams();
  return <Syllabus subjectId={subjectId ?? null} />;
}

function LegacyPaperInPapers() {
  // /papers/paper-xxx purana pattern → /paper/xxx
  const { subjectId } = useParams();
  return <Navigate to={`/paper/${subjectId}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter basename="/papervault">
      <ScrollToTop />
      <HashRedirect />
      <RouteMeta />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/papers" element={<Papers />} />
        <Route path="/papers/paper-:paperId" element={<LegacyPaperInPapers />} />
        <Route path="/papers/:subjectId" element={<SubjectRoute />} />
        <Route path="/paper/:paperId" element={<PaperRoute />} />
        <Route path="/syllabus" element={<SyllabusRoute />} />
        <Route path="/syllabus/:subjectId" element={<SyllabusRoute />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/my-uploads" element={<MyUploads />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin/*" element={<AdminGate key="admin" />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
