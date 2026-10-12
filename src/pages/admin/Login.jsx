/**
 * PaperVault — Admin login page (Firebase-backed).
 * Google sign-in; only users with users/{uid}.role === "admin" get in.
 * 100% original, Direction A "Archive Noir".
 */
import Icon from "../../components/Icon.jsx";
import BrandLogo from "../../components/BrandLogo.jsx";
import { Button } from "../../components/atoms.jsx";

function friendlyError(error) {
  if (!error) return "";
  if (error === "not-admin")
    return "This Google account lacks administrator permissions. Ensure role = \"admin\" in users/{uid} document.";
  const code = error?.code || "";
  if (code === "auth/unauthorized-domain")
    return "Domain is not authorized in Firebase Console > Authentication > Settings > Authorized Domains.";
  if (code === "auth/popup-blocked")
    return "Sign-in popup was blocked. Please allow popups in your browser and try again.";
  return error?.message || "Authentication failed. Please try again.";
}

export default function AdminLogin({ onSignIn, error, busy }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-6">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <p className="font-display text-lg font-bold text-text">PaperVault</p>
            <p className="micro">Admin Portal &middot; 2026</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-text-dim">
          Sign in with your <strong className="text-text">administrator Google account</strong> to access
          the moderation console. Accounts must have{" "}
          <code className="text-accent">role = "admin"</code> configured in Firestore{" "}
          <code className="text-accent">users/{"{uid}"}</code>.
        </p>

        {error && (
          <p className="mt-4 flex items-start gap-1.5 rounded-lg border border-brick/40 bg-brick/10 p-3 text-[13px] text-brick">
            <Icon name="close" size={14} className="mt-0.5 shrink-0" />
            <span>{friendlyError(error)}</span>
          </p>
        )}

        <Button onClick={onSignIn} disabled={busy} className="mt-5 w-full">
          <span className="inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 1 0 12 20.9c4.45 0 8.6-3.15 8.6-8.95 0-.3-.05-.6-.25-.85Z" />
            </svg>
            {busy ? "Signing in…" : "Sign In with Google"}
          </span>
        </Button>

        <p className="micro mt-4 text-center">
          Setup: Firebase Console → Firestore → users/{"{uid}"} → role = "admin"
        </p>
      </div>
    </div>
  );
}
