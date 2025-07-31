// src/pages/ChatPage.tsx
import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { toast } from "react-hot-toast";
import { SendHorizonal, Loader2 } from "lucide-react";



export default function ChatPage() {
  const { user } = useAuth();
  const { clubId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
console.log("🔥 Club ID:", clubId);
  const isAuthorized = async () => {
    if (!user || !clubId) return false;
    if (user.role === "leader") return true;

    const docRef = doc(db, `clubs/${clubId}/members/${user.uid}`);
    const snap = await getDoc(docRef);
    return snap.exists();
  };

  useEffect(() => {
    const checkAccessAndSubscribe = async () => {
      const allowed = await isAuthorized();
      if (!allowed) {
        toast.error("❌ You are not authorized to access this chat.");
        return;
      }

      const q = query(
        collection(db, `clubs/${clubId}/chats`),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snap) => {
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(data);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkAccessAndSubscribe();
  }, [clubId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
  if (!newMsg.trim()) return;

  try {
    await addDoc(collection(db, `clubs/${clubId}/chats`), {
      message: newMsg.trim(),
      senderId: user?.uid,
      senderName: user?.displayName || user?.email || "Unknown",
      timestamp: Timestamp.now(),
    });
    setNewMsg("");
  } catch (err) {
    console.error("❌ Failed to send:", err);
    toast.error("❌ Failed to send message");
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen flex flex-col bg-[#0d0d0d] text-white font-mono">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
        💬 Club Chat Room
      </h2>

      <div className="flex-1 overflow-y-auto border border-gray-700 rounded-lg p-4 mb-4 bg-[#111] space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-sm ${
                msg.senderId === user?.uid
                  ? "bg-green-900 ml-auto text-right"
                  : "bg-gray-800 mr-auto"
              }`}
            >
              <div className="text-sm font-semibold">{msg.senderName}</div>
              <div className="text-base">{msg.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {msg.timestamp?.toDate().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md flex items-center justify-center"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
