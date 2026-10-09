/**
 * PaperVault — Admin route gate (Firebase-backed).
 * Decides: loading → login → not-admin → admin pages.
 * 100% original, Direction A "Archive Noir".
 */
import Dashboard from "./Dashboard.jsx";
import Moderation from "./Moderation.jsx";
import Subjects from "./Subjects.jsx";
import SyllabusManager from "./SyllabusManager.jsx";
import NotesManager from "./NotesManager.jsx";
import PapersManager from "./PapersManager.jsx";
import Users from "./Users.jsx";
import ExamSettings from "./ExamSettings.jsx";
import BulkImport from "./BulkImport.jsx";
import AdminLogin from "./Login.jsx";
import { useAdminAuth } from "./adminAuth.js";
import { MicroLabel, Button } from "../../components/atoms.jsx";
import Icon from "../../components/Icon.jsx";

function Center({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm text-center">{children}</div>
    </div>
  );
}

export default function AdminGate({ sub }) {
  const { user, isAdmin, loading, error, signIn, signOut } = useAdminAuth();

  if (loading) {
    return (
      <Center>
        <MicroLabel>PaperVault · Admin</MicroLabel>
        <p className="mt-3 text-sm text-text-dim">Checking admin access…</p>
      </Center>
    );
  }

  if (!user) {
    return <AdminLogin onSignIn={signIn} error={error} busy={false} />;
  }

  if (!isAdmin) {
    return (
      <Center>
        <MicroLabel>PaperVault · Admin</MicroLabel>
        <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full border border-brick/40 bg-brick/10 text-brick">
          <Icon name="close" size={22} />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-text">Access nahi hai</h1>
        <p className="mt-2 text-sm text-text-dim">
          <strong className="text-text">{user.email || user.displayName}</strong> admin nahi hai.
          Firebase console → Firestore → <code className="text-accent">users/{user.uid}</code> me{" "}
          <code className="text-accent">role = "admin"</code> set karo, phir dobara kholo.
        </p>
        <Button onClick={signOut} className="mt-6 w-full">
          Sign out
        </Button>
      </Center>
    );
  }

  if (sub === "logout") {
    signOut();
    window.location.hash = "#/";
    return null;
  }

  if (sub === "moderation") return <Moderation />;
  if (sub === "subjects") return <Subjects />;
  if (sub === "syllabus") return <SyllabusManager />;
  if (sub === "notes") return <NotesManager />;
  if (sub === "papers") return <PapersManager />;
  if (sub === "users") return <Users />;
  if (sub === "exam") return <ExamSettings />;
  if (sub === "bulk-import") return <BulkImport />;
  return <Dashboard />;
}
