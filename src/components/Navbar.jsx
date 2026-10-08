import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

// TODO: wire useAuth() — show profile avatar when logged in, Login button otherwise.
const links = [
  { label: "Papers", href: "#/papers", match: ["papers"] },
  { label: "Syllabus", href: "#/syllabus", match: ["syllabus"] },
  { label: "Requests", href: "#/requests", match: ["requests"] },
  { label: "Chat", href: "#/chat", match: ["chat"] },
];

function activeSection() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return raw.split("/").filter(Boolean)[0] ?? "";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(activeSection);

  useEffect(() => {
    const onChange = () => {
      setSection(activeSection());
      setOpen(false);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <a href="#/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Icon name="file" size={18} className="text-canvas" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[17px] font-extrabold tracking-tight text-text">
              Paper<span className="text-accent">Vault</span>
            </span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
              VIT-AP ka paper vault
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => {
            const active = l.match.includes(section);
            return (
              <a
                key={l.label}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-lg px-3.5 py-2 text-[14px] font-medium transition-colors ${
                  active ? "text-text" : "text-text-dim hover:text-text"
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-3.5 -bottom-[15px] h-[3px] rounded-full bg-accent transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                />
              </a>
            );
          })}
          <a
            href="#/upload"
            className="ml-3 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-accent px-4 text-[13.5px] font-bold text-canvas transition-colors hover:bg-[#FFBE4D]"
          >
            <Icon name="upload" size={16} />
            Upload
          </a>
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
              <a
                key={l.label}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-3 py-3 text-[15px] font-medium ${
                  active ? "bg-surface-plus text-text" : "text-text-dim"
                }`}
              >
                {l.label}
              </a>
            );
          })}
          <a
            href="#/upload"
            className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[15px] font-bold text-canvas"
          >
            <Icon name="upload" size={17} />
            Paper upload karo
          </a>
        </nav>
      )}
    </header>
  );
}
