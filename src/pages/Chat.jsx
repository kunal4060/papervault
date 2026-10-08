/**
 * PaperVault — Community Chat page (`/chat`).
 *
 * Direction A "Archive Noir": dark vault chat. Room rail (mobile chips /
 * desktop sidebar), message pane with auto-scroll, linkified text,
 * login-gated send, delete for own messages.
 *
 * Live Firestore via src/hooks/useChat.js — real-time messages, no mock.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useChat } from "../hooks/useChat.js";
import { getChatRooms } from "../firebase/db.js";

/* ------------------------------------------------------------------ */
/* linkify: http(s) URLs + www. become anchors                          */
/* ------------------------------------------------------------------ */
const URL_RE = /((?:https?:\/\/|www\.)[^\s<>"')\]]+)/gi;

function linkify(text) {
  const parts = [];
  let last = 0;
  let m;
  let key = 0;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const url = m[0];
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    parts.push(
      <a
        key={`l${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-accent underline decoration-accent-dim underline-offset-2"
      >
        {url}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ------------------------------------------------------------------ */
function fmtTime(v) {
  try {
    const d =
      v && typeof v.toDate === "function" ? v.toDate() : new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function initials(name = "?") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/* message bubble                                                      */
/* ------------------------------------------------------------------ */
function MessageBubble({ msg, isOwn, onDelete }) {
  return (
    <div className="group flex gap-2.5 px-1">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${
          isOwn
            ? "bg-surface-plus text-accent"
            : "bg-surface-plus text-text-dim"
        }`}
      >
        {initials(msg.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-semibold text-text">
            {msg.name}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-text-dim">
            {fmtTime(msg.createdAt)}
          </span>
          {isOwn && (
            <button
              onClick={() => onDelete(msg.id)}
              aria-label="Delete message"
              className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-dim transition-opacity hover:bg-surface-plus hover:text-brick md:opacity-0 md:group-hover:opacity-100"
            >
              <Icon name="trash" size={15} />
            </button>
          )}
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-text">
          {linkify(msg.text)}
        </p>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [roomId, setRoomId] = useState("lobby");
  const [rooms, setRooms] = useState([]);
  const { messages, loading, sendMessage, deleteMessage } = useChat(roomId);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  // load rooms: lobby + one per active subject (live Firestore)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getChatRooms();
        if (cancelled) return;
        setRooms(list);
        // keep selection valid when the list arrives
        setRoomId((cur) =>
          list.some((r) => r.id === cur) ? cur : (list[0]?.id ?? "lobby")
        );
      } catch (err) {
        console.error("[Chat] rooms load failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Firestore already orders by createdAt asc; copy defensively.
  const allVisible = useMemo(() => [...messages], [messages]);

  // auto-scroll to latest
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allVisible.length, loading, roomId]);

  const activeRoom = rooms.find((r) => r.id === roomId);

  async function handleSend() {
    if (!user || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendMessage(text, user);
      setDraft("");
    } catch (err) {
      console.error("[Chat] send failed:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteMessage(id);
    } catch (err) {
      console.error("[Chat] delete failed:", err);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-4 pb-4 pt-4 md:h-[calc(100dvh-4rem)] lg:max-w-7xl lg:px-6 lg:pt-6 xl:max-w-[1400px]">
      {/* header */}
      <div className="mb-3 flex items-baseline justify-between lg:mb-4">
        <div>
          <p className="micro">Community</p>
          <h1 className="font-display text-2xl font-bold text-text lg:text-3xl lg:tracking-tight">
            Chat <span className="hl-soft text-accent">rooms</span>
          </h1>
        </div>
        <span className="rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[11px] text-text-dim">
          {rooms.length} rooms
        </span>
      </div>

      {/* room rail (mobile) */}
      <div className="rail -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {rooms.map((r) => (
          <button
            key={r.id}
            onClick={() => setRoomId(r.id)}
            className={`min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
              roomId === r.id
                ? "border-accent-dim bg-accent/10 text-accent"
                : "border-hairline bg-surface text-text-dim hover:text-text"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        {/* sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 flex-col gap-1 lg:flex xl:w-80">
          <p className="micro mb-1 px-2">Rooms</p>
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoomId(r.id)}
              className={`group flex min-h-[48px] items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-all duration-200 ${
                roomId === r.id
                  ? "border-accent-dim bg-accent/10 text-text shadow-[inset_0_0_0_1px_rgba(255,178,36,0.25)]"
                  : "border-transparent text-text-dim hover:bg-surface hover:text-text"
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold transition-colors ${
                roomId === r.id ? "bg-accent text-canvas" : "bg-surface-plus text-text-dim group-hover:text-text"
              }`}>
                {r.id === "lobby" ? "✦" : r.name.trim()[0]}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
              {r.id === "lobby" && (
                <span className="micro shrink-0 text-[10px]">All</span>
              )}
            </button>
          ))}
          <div className="mt-3 rounded-xl border border-hairline bg-surface p-3.5 lg:p-4">
            <p className="micro mb-1">Tip</p>
            <p className="text-xs leading-relaxed text-text-dim">
              Paper ka link paste karo — automatic clickable ho jayega.
              Apne messages tum delete kar sakte ho.
            </p>
          </div>
        </aside>

        {/* message pane */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-hairline bg-surface lg:rounded-2xl lg:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3 lg:px-5 lg:py-3.5">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-text">
                {activeRoom?.name}
              </h2>
              <p className="micro text-[10px]">
                {activeRoom?.type === "lobby"
                  ? "Everyone · read-only without login"
                  : "Subject room"}
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 font-mono text-[10px] text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" />
              live
            </span>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-surface-plus" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-surface-plus" />
                      <div className="h-3 w-3/4 rounded bg-surface-plus" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allVisible.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Icon name="spark" size={28} className="text-text-dim" />
                <p className="text-sm font-medium text-text">
                  No messages yet in {activeRoom?.name}
                </p>
                <p className="max-w-[240px] text-xs text-text-dim">
                  {user
                    ? "Start the conversation — ask a doubt or share a paper."
                    : "Login to send the first message here."}
                </p>
              </div>
            ) : (
              allVisible.map((m) => (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  isOwn={!!user && m.uid === user.uid}
                  onDelete={handleDelete}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* composer / login gate */}
          {authLoading ? (
            <div className="border-t border-hairline p-4">
              <div className="h-11 rounded-lg bg-surface-plus" />
            </div>
          ) : user ? (
            <div className="border-t border-hairline p-3 lg:p-4">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Doubt poochho ya message likho…"
                  className="min-h-[44px] flex-1 rounded-lg border border-hairline bg-canvas px-3 text-sm text-text placeholder:text-text-dim/60 focus:border-accent-dim focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  aria-label="Send message"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-canvas transition-opacity disabled:opacity-30"
                >
                  <Icon name="send" size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-hairline p-4">
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-hairline bg-canvas px-4 py-5 text-center">
                <p className="text-sm font-medium text-text">
                  Chat padh sakte ho, likhne ke liye login chahiye
                </p>
                <p className="text-xs text-text-dim">
                  Doubts poochho, papers share karo — Google se 10 second me.
                </p>
                <button
                  onClick={() => signIn()}
                  className="mt-1 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-5 text-sm font-semibold text-canvas"
                >
                  Login to chat
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
