/**
 * PaperVault — Admin login page (Firebase-backed).
 * Google sign-in; only users with users/{uid}.role === "admin" get in.
 * 100% original, Direction A "Archive Noir".
 */
import Icon from "../../components/Icon.jsx";
import { Button } from "../../components/atoms.jsx";

function friendlyError(error) {
  if (!error) return "";
  if (error === "not-admin")
    return "Ye Google account admin nahi hai. Firebase console me users/{uid} doc me role = \"admin\" set karo.";
  const code = error?.code || "";
  if (code === "auth/unauthorized-domain")
    return "Domain authorized nahi hai — Firebase console → Authentication → Settings → Authorized domains me ye domain add karo.";
  if (code === "auth/popup-blocked")
    return "Popup block ho gaya — browser me popups allow karo aur dobara try karo.";
  return error?.message || "Login fail ho gaya. Dobara try karo.";
}

export default function AdminLogin({ onSignIn, error, busy }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-display text-lg font-bold text-[#0C0D10]">
            P
          </span>
          <div>
            <p className="font-display text-lg font-bold text-text">PaperVault</p>
            <p className="micro">Admin login</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-text-dim">
          Admin panel ke liye apne <strong className="text-text">admin Google account</strong> se
          sign in karo. Sirf wahi account chalega jiska Firestore{" "}
          <code className="text-accent">users/{"{uid}"}</code> doc me{" "}
          <code className="text-accent">role = "admin"</code> ho.
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
            {busy ? "Sign in ho raha hai…" : "Google se sign in karo"}
          </span>
        </Button>

        <p className="micro mt-4 text-center">
          Pehli baar? Firebase console → Firestore → users → apna uid → role = "admin"
        </p>
      </div>
    </div>
  );
}
