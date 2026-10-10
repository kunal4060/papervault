import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useAuth } from "../hooks/useAuth.js";

// TODO: profile page — avatar menu abhi My Uploads + Logout deta hai.
const links = [
  { label: "Papers", to: "/papers", match: ["papers"] },
  { label: "Syllabus", to: "/syllabus", match: ["syllabus"] },
  { label: "Requests", to: "/requests", match: ["requests"] },
  { label: "Chat", to: "/chat", match: ["chat"] },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const { pathname } = useLocation();
  const section = pathname.split("/").filter(Boolean)[0] ?? "";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:h-[4.5rem] lg:max-w-7xl lg:px-6 xl:max-w-[1400px]">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shadow-[0_4px_16px_-4px_rgba(255,178,36,0.55)] transition-transform duration-200 group-hover:-rotate-6 lg:h-10 lg:w-10">
            <Icon name="file" size={18} className="text-canvas" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[17px] font-extrabold tracking-tight text-text lg:text-[19px]">
              Paper<span className="text-accent">Vault</span>
            </span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
              VIT-AP ka paper vault
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary">
          {links.map((l) => {
            const active = l.match.includes(section);
            return (
              <Link
                key={l.label}
                to={l.to}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-surface-plus text-text shadow-[inset_0_0_0_1px_var(--color-hairline)]"
                    : "text-text-dim hover:bg-surface hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            to="/upload"
            className="ml-3 inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-accent px-5 text-[13.5px] font-bold text-canvas shadow-[0_4px_20px_-4px_rgba(255,178,36,0.5)] transition-all duration-200 hover:-translate-y-px hover:bg-[#FFBE4D] hover:shadow-[0_8px_28px_-4px_rgba(255,178,36,0.65)]"
          >
            <Icon name="upload" size={16} />
            Upload
          </Link>
          {/* Auth: login button ya avatar menu */}
          {!authLoading &&
            (user ? (
              <div className="relative ml-1">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-plus font-display text-sm font-bold text-accent shadow-[inset_0_0_0_1px_var(--color-hairline)]"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                >
                  {(user.displayName || user.email || "S").trim().charAt(0).toUpperCase()}
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-hairline bg-surface shadow-xl">
                      <p className="truncate border-b border-hairline px-4 py-2.5 text-xs text-text-dim">
                        {user.displayName || user.email}
                      </p>
                      <Link
                        to="/my-uploads"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm font-medium text-text hover:bg-surface-plus"
                      >
                        My uploads
                      </Link>
                      <button
                        onClick={() => { setMenuOpen(false); signOut(); }}
                        className="block w-full px-4 py-3 text-left text-sm font-medium text-text-dim hover:bg-surface-plus hover:text-text"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={signIn}
                className="ml-1 inline-flex min-h-[40px] items-center rounded-xl px-4 text-[13.5px] font-semibold text-text-dim transition-colors hover:bg-surface hover:text-text"
              >
                Login
              </button>
            ))}
        </nav>

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-dim hover:bg-surface-plus hover:text-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menu band karo" : "Menu kholo"}
          aria-expanded={open}
        >
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-hairline bg-canvas px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile"
        >
          {links.map((l) => {
            const active = l.match.includes(section);
            return (
              <Link
                key={l.label}
                to={l.to}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-3 py-3 text-[15px] font-medium ${
                  active ? "bg-surface-plus text-text" : "text-text-dim"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            to="/upload"
            className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[15px] font-bold text-canvas"
          >
            <Icon name="upload" size={17} />
            Paper upload karo
          </Link>
          {/* Mobile auth links */}
          {!authLoading &&
            (user ? (
              <>
                <Link
                  to="/my-uploads"
                  className="block rounded-lg px-3 py-3 text-[15px] font-medium text-text-dim"
                >
                  My uploads
                </Link>
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="block w-full rounded-lg px-3 py-3 text-left text-[15px] font-medium text-text-dim"
                >
                  Logout ({(user.displayName || user.email || "").split(" ")[0]})
                </button>
              </>
            ) : (
              <button
                onClick={() => { signIn(); setOpen(false); }}
                className="mt-2 block w-full rounded-lg border border-hairline px-3 py-3 text-center text-[15px] font-semibold text-text"
              >
                Login karo
              </button>
            ))}
        </nav>
      )}
    </header>
  );
}
