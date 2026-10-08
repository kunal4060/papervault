/**
 * PaperVault — Admin login page.
 * Mock credentials: user `admin` / password `admin`.
 * 100% original, Direction A "Archive Noir".
 */
import { useEffect, useState } from "react";
import Icon from "../../components/Icon.jsx";
import { Button, Field, Input } from "../../components/atoms.jsx";
import { adminLogin, isAdminLoggedIn } from "./adminAuth.js";

export default function AdminLogin({ onSuccess }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [skipped, setSkipped] = useState(false);

  // Already logged in (e.g. back-button) → skip form (in effect, not render).
  useEffect(() => {
    if (isAdminLoggedIn()) {
      setSkipped(true);
      onSuccess();
    }
  }, [onSuccess]);

  if (skipped) return null;

  const submit = (e) => {
    e.preventDefault();
    if (adminLogin(user.trim(), pass)) {
      setError("");
      onSuccess();
    } else {
      setError("Galat username ya password. Phir se try karo.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-6"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent font-display text-lg font-bold text-[#0C0D10]">
            P
          </span>
          <div>
            <p className="font-display text-lg font-bold text-text">PaperVault</p>
            <p className="micro">Admin login</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Username">
            <Input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </Field>
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-brick">
            <Icon name="close" size={14} />
            {error}
          </p>
        )}

        <Button type="submit" className="mt-5 w-full">
          Login
        </Button>

        <p className="mt-4 text-center text-[12px] text-text-dim">
          Mock login — username <span className="font-mono">admin</span>,
          password <span className="font-mono">admin</span>
        </p>
      </form>
    </div>
  );
}
