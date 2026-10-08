/**
 * PaperVault — Community Chat page (`/chat`).
 *
 * Direction A "Archive Noir": dark vault chat. Room rail (mobile chips /
 * desktop sidebar), message pane with auto-scroll, linkified text,
 * attachment chips, @ai mock replies, login-gated send, hover-delete for
 * own messages (mock-local).
 *
 * Mock only — powered by src/hooks/useChat.js + src/mock/chat.js.
 * // TODO: firebase — useChat will swap to Firestore real-time.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useChat } from "../hooks/useChat.js";
import { chatRooms } from "../mock/index.js";

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
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
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
function MessageBubble({ msg, isOwn, isAI, onDelete }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="group flex gap-2.5 px-1"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ${
          isAI
            ? "bg-accent text-canvas"
            : isOwn
              ? "bg-surface-plus text-accent"
              : "bg-surface-plus text-text-dim"
        }`}
      >
        {isAI ? <Icon name="spark" size={14} /> : initials(msg.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-semibold text-text">
            {msg.name}
          </span>
          {isAI && (
            <span className="rounded-full border border-accent-dim px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
              AI
            </span>
          )}
          <span className="shrink-0 font-mono text-[10px] text-text-dim">
            {fmtTime(msg.createdAt)}
          </span>
          {isOwn && hover && (
            <button
              onClick={() => onDelete(msg.id)}
              aria-label="Delete message"
              className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-dim opacity-0 transition-opacity hover:bg-surface-plus hover:text-brick group-hover:opacity-100"
            >
              <Icon name="trash" size={15} />
            </button>
          )}
        </div>

        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-text">
          {linkify(msg.text)}
        </p>

        {msg.attachments?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.attachments.map((a, i) => (
              <span
                key={i}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-hairline bg-surface px-3 text-sm text-text"
              >
                <Icon
                  name={a.type === "image" ? "image" : "file"}
                  size={16}
                  className="shrink-0 text-accent"
                />
                <span className="max-w-[180px] truncate font-mono text-xs">
                  {a.name}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
const AI_REPLIES = [
  "Mock AI jawab: Ye topic syllabus ke module-wise weightage se match hota hai. Uss paper ka AI analysis kholo — topic breakdown me exact question numbers milenge.",
  "Mock AI jawab: Chhota summary — pichle 3 saal ke papers me is topic se avg 30–40% questions aaye hain. CAT-2 me Q2/Q5 type questions aksar repeat hote hain. Detail paper page pe milega.",
];

export default function Chat() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [roomId, setRoomId] = useState("lobby");
  const { messages, loading, sendMessage } = useChat(roomId);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [deletedIds, setDeletedIds] = useState(() => new Set());
  const [aiTyping, setAiTyping] = useState(false);
  const [attached, setAttached] = useState(null); // {name, type} mock only
  const [aiExtras, setAiExtras] = useState([]); // mock AI replies in this room

  const bottomRef = useRef(null);

  const allVisible = useMemo(() => {
    const base = messages.filter((m) => !deletedIds.has(m.id));
    const ai = aiExtras.filter((m) => m.roomId === roomId);
    return [...base, ...ai].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages, deletedIds, aiExtras, roomId]);

  // auto-scroll to latest
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allVisible.length, loading, roomId]);

  const activeRoom = chatRooms.find((r) => r.id === roomId);

  async function handleSend() {
    if (!user || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      // mock: attachments are stored on a parallel queue keyed by room+text —
      // useChat's sendMessage takes (text, user) only, so we merge locally
      // when rendering (see attachFor).
      await sendMessage(text, user);
      if (attached) {
        pendingAttachments.push({
          roomId,
          text,
          uid: user.uid,
          attachments: [
            { type: attached.type, url: "#", name: attached.name },
          ],
        });
        setAttached(null);
      }
      setDraft("");
      if (text.toLowerCase().startsWith("@ai")) {
        setAiTyping(true);
        setTimeout(() => {
          setAiExtras((p) => [
            ...p,
            {
              id: `msg-ai-${Date.now()}`,
              roomId,
              uid: "ai-assistant",
              name: "PaperVault AI",
              text: AI_REPLIES[
                Math.floor(Math.random() * AI_REPLIES.length)
              ],
              attachments: [],
              createdAt: new Date().toISOString(),
            },
          ]);
          setAiTyping(false);
        }, 1000);
      }
    } finally {
      setSending(false);
    }
  }

  // attach mock-sent attachments to the matching mock message
  function attachFor(m) {
    if (m.uid === "ai-assistant") return m.attachments;
    const hit = pendingAttachments.find(
      (p) => p.roomId === m.roomId && p.text === m.text && p.uid === m.uid
    );
    return hit ? hit.attachments : m.attachments;
  }

  function handleDelete(id) {
    setDeletedIds((prev) => new Set(prev).add(id));
  }

  function handleAttach(kind) {
    if (!user) return;
    const stamp = new Date().toISOString().slice(11, 16).replace(":", "");
    setAttached(
      kind === "image"
        ? { name: `doubt-${stamp}.png`, type: "image" }
        : { name: `paper-${stamp}.pdf`, type: "pdf" }
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-6xl flex-col px-4 pb-4 pt-4 md:h-[calc(100dvh-4rem)]">
      {/* header */}
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="micro">Community</p>
          <h1 className="font-display text-2xl font-bold text-text">
            Chat <span className="hl-soft text-accent">rooms</span>
          </h1>
        </div>
        <span className="font-mono text-[11px] text-text-dim">
          {chatRooms.length} rooms
        </span>
      </div>

      {/* room rail (mobile) */}
      <div className="rail -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 lg:hidden">
        {chatRooms.map((r) => (
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
        <aside className="hidden w-60 shrink-0 flex-col gap-1 lg:flex">
          <p className="micro mb-1 px-2">Rooms</p>
          {chatRooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoomId(r.id)}
              className={`flex min-h-[44px] items-center justify-between rounded-lg border px-3 text-left text-sm transition-colors ${
                roomId === r.id
                  ? "border-accent-dim bg-accent/10 text-text"
                  : "border-transparent text-text-dim hover:bg-surface hover:text-text"
              }`}
            >
              <span className="truncate font-medium">{r.name}</span>
              {r.type === "lobby" && (
                <span className="micro text-[10px]">All</span>
              )}
            </button>
          ))}
          <div className="mt-3 rounded-xl border border-hairline bg-surface p-3">
            <p className="micro mb-1">Tip</p>
            <p className="text-xs leading-relaxed text-text-dim">
              Type <span className="font-mono text-accent">@ai</span> at the
              start of a message to ask the AI a doubt.
            </p>
          </div>
        </aside>

        {/* message pane */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-hairline bg-surface">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
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

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
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
                  msg={{ ...m, attachments: attachFor(m) }}
                  isAI={m.uid === "ai-assistant"}
                  isOwn={!!user && m.uid === user.uid}
                  onDelete={handleDelete}
                />
              ))
            )}
            {aiTyping && (
              <div className="flex items-center gap-2 px-1 text-xs text-text-dim">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                PaperVault AI is typing…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* composer / login gate */}
          {authLoading ? (
            <div className="border-t border-hairline p-4">
              <div className="h-11 rounded-lg bg-surface-plus" />
            </div>
          ) : user ? (
            <div className="border-t border-hairline p-3">
              {attached && (
                <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-accent-dim bg-accent/10 px-3 py-1.5 text-xs text-accent">
                  <Icon
                    name={attached.type === "image" ? "image" : "file"}
                    size={14}
                  />
                  <span className="font-mono">{attached.name}</span>
                  <button
                    onClick={() => setAttached(null)}
                    aria-label="Remove attachment"
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-accent hover:text-text"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleAttach("image")}
                    aria-label="Attach image"
                    title="Attach image"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-surface-plus hover:text-accent"
                  >
                    <Icon name="image" size={18} />
                  </button>
                  <button
                    onClick={() => handleAttach("pdf")}
                    aria-label="Attach PDF"
                    title="Attach PDF"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-surface-plus hover:text-accent"
                  >
                    <Icon name="paperclip" size={18} />
                  </button>
                </div>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="@ai doubt poochho ya message likho…"
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

/**
 * Mock-local attachment store (module scope, like useChat's sentMessages).
 * Shape: { roomId, text, uid, attachments[] }
 */
const pendingAttachments = [];
