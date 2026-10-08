/**
 * PaperVault useChat hook — messages for one chat room + send.
 *
 * MOCK MODE: reads chatRooms/chatMessages from src/mock/index.js and keeps
 * sent messages in a module-level store (so they survive re-renders).
 * Sending requires a logged-in user (UI should gate on useAuth).
 *
 * // TODO: firebase — replace with Firestore real-time:
 *   onSnapshot(query(collection(db, "chatRooms", roomId, "messages"),
 *                    orderBy("createdAt"), limit(100)), cb)
 *   addDoc(...) for sendMessage.
 */
import { useCallback, useEffect, useState } from "react";
import { chatMessages as MOCK_MESSAGES } from "../mock/index.js";

/** In-memory store for mock-sent messages, keyed by roomId. */
const sentMessages = new Map(); // roomId -> Array

function allMessages(roomId) {
  const base = MOCK_MESSAGES.filter((m) => m.roomId === roomId);
  const extra = sentMessages.get(roomId) ?? [];
  return [...base, ...extra].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
}

/**
 * @param {string|null} roomId — "lobby" or a subjectId
 * @returns {{ messages: Array, loading: boolean, error: Error|null,
 *            sendMessage: (text: string, user: Object) => Promise<void> }}
 */
export function useChat(roomId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    // Simulate the async subscribe; TODO: replace with onSnapshot.
    const t = setTimeout(() => {
      if (!cancelled) {
        try {
          setMessages(allMessages(roomId));
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (text, user) => {
      const trimmed = (text ?? "").trim();
      if (!trimmed) return;
      if (!user) throw new Error("Login required to send messages");
      if (!roomId) throw new Error("No room selected");

      const msg = {
        id: `msg-mock-${Date.now()}`,
        roomId,
        uid: user.uid,
        name: user.name,
        photo: user.photo ?? null,
        text: trimmed,
        attachments: [],
        createdAt: new Date().toISOString(),
      };

      // TODO: firebase — addDoc(collection(db, "chatRooms", roomId, "messages"), {...})
      const list = sentMessages.get(roomId) ?? [];
      list.push(msg);
      sentMessages.set(roomId, list);
      setMessages(allMessages(roomId));
    },
    [roomId]
  );

  return { messages, loading, error, sendMessage };
}
