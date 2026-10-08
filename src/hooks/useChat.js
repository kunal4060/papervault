/**
 * PaperVault useChat hook — messages for one chat room + send/delete.
 *
 * LIVE Firestore: subscribes real-time to
 *   chatRooms/{roomId}/messages (orderBy createdAt asc, limit 200).
 * Sending requires a logged-in user (UI gates on useAuth). Deleting is
 * allowed for the message's own author (Firestore rules enforce it).
 */
import { useCallback, useEffect, useState } from "react";
import {
  subscribeChatMessages,
  sendChatMessage as dbSend,
  deleteChatMessage as dbDelete,
} from "../firebase/db.js";

/**
 * @param {string|null} roomId — "lobby" or a subjectId
 * @returns {{ messages: Array, loading: boolean, error: Error|null,
 *            sendMessage: (text: string, user: Object) => Promise<void>,
 *            deleteMessage: (messageId: string) => Promise<void> }}
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
    setLoading(true);
    setError(null);
    const unsub = subscribeChatMessages(roomId, (msgs, err) => {
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      setMessages(msgs);
      setLoading(false);
    });
    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, [roomId]);

  const sendMessage = useCallback(
    async (text, user) => {
      const trimmed = (text ?? "").trim();
      if (!trimmed) return;
      if (!user) throw new Error("Login required to send messages");
      if (!roomId) throw new Error("No room selected");
      await dbSend(roomId, {
        uid: user.uid,
        name: user.name,
        photo: user.photo ?? null,
        text: trimmed,
      });
    },
    [roomId]
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!roomId || !messageId) return;
      await dbDelete(roomId, messageId);
    },
    [roomId]
  );

  return { messages, loading, error, sendMessage, deleteMessage };
}
