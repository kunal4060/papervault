import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useAuth } from "../hooks/useAuth.js";

const links = [
  { label: "Papers", to: "/papers", match: ["papers", "paper"] },
  { label: "Notes", to: "/syllabus", match: ["syllabus"] },
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
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas-subtle/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:h-[4.5rem] lg:max-w-7xl lg:px-6 xl:max-w-[1400px]">
        {/* Brand Logo */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-canvas shadow-[0_2px_14px_rgba(255,255,255,0.22)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_20px_rgba(255,255,255,0.35)] lg:h-10 lg:w-10">
            <Icon name="file" size={18} className="text-canvas" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[17px] font-extrabold tracking-tight text-white lg:text-[19px]">
              Paper<span className="text-text-muted">Vault</span>
            </span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
              VIT-AP Archive
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
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
                    ? "border border-hairline-bright bg-surface-plus text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-text-dim hover:bg-surface hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          <Link
            to="/upload"
            className="metallic-button ml-3 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-5 text-[13.5px] font-bold text-canvas shadow-[0_2px_14px_rgba(255,255,255,0.15)] transition-all duration-200"
          >
            <Icon name="upload" size={16} />
            Upload
          </Link>

          {/* User Auth Controls */}
          {!authLoading &&
            (user ? (
              <div className="relative ml-1">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline-bright bg-surface-plus font-display text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform hover:scale-105"
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
                    <div className="metallic-card absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-hairline bg-surface p-1 shadow-2xl">
                      <p className="truncate border-b border-hairline px-3.5 py-2.5 font-mono text-[11px] text-text-dim">
                        {user.displayName || user.email}
                      </p>
                      <Link
                        to="/my-uploads"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3.5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-plus hover:text-white"
                      >
                        My uploads
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-text-dim transition-colors hover:bg-surface-plus hover:text-brick"
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
                className="ml-1 inline-flex min-h-[40px] items-center rounded-xl px-4 text-[13.5px] font-semibold text-text-dim transition-colors hover:bg-surface hover:text-white"
              >
                Login
              </button>
            ))}
        </nav>

        {/* Mobile menu trigger */}
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-hairline bg-surface text-text-dim transition-colors hover:border-hairline-bright hover:text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menu band karo" : "Menu kholo"}
          aria-expanded={open}
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav
          className="border-t border-hairline bg-canvas-subtle/95 px-4 pb-5 pt-3 backdrop-blur-2xl md:hidden"
          aria-label="Mobile Navigation"
        >
          <div className="space-y-1">
            {links.map((l) => {
              const active = l.match.includes(section);
              return (
                <Link
                  key={l.label}
                  to={l.to}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-3.5 py-3 text-[15px] font-medium transition-colors ${
                    active
                      ? "border border-hairline-bright bg-surface-plus text-white font-semibold"
                      : "text-text-dim hover:bg-surface hover:text-text"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-hairline pt-3">
            <Link
              to="/upload"
              className="metallic-button flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-bold text-canvas"
            >
              <Icon name="upload" size={17} />
              Paper upload karo
            </Link>

            {!authLoading &&
              (user ? (
                <div className="mt-2 space-y-1">
                  <Link
                    to="/my-uploads"
                    className="block rounded-lg px-3.5 py-3 text-[15px] font-medium text-text-dim hover:text-white"
                  >
                    My uploads
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="block w-full rounded-lg px-3.5 py-3 text-left text-[15px] font-medium text-text-dim hover:text-brick"
                  >
                    Logout ({(user.displayName || user.email || "").split(" ")[0]})
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signIn();
                    setOpen(false);
                  }}
                  className="metallic-button-secondary mt-2 block w-full rounded-xl px-4 py-3 text-center text-[15px] font-semibold"
                >
                  Login karo
                </button>
              ))}
          </div>
        </nav>
      )}
    </header>
  );
}
